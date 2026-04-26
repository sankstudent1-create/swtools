create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_pricing (
  tool_id text primary key,
  download_credits integer not null default 10,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_topup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_inr numeric not null,
  credits_requested bigint not null,
  utr text unique not null,
  screenshot_path text null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  reviewed_by uuid null references auth.users(id) on delete set null,
  admin_notes text null
);

alter table public.manual_topup_requests
  drop constraint if exists manual_topup_requests_user_id_fkey;

alter table public.manual_topup_requests
  add constraint manual_topup_requests_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.manual_topup_requests enable row level security;

drop policy if exists "manual_topup_requests_insert_own" on public.manual_topup_requests;
create policy "Users can insert manual topup requests" on manual_topup_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "manual_topup_requests_select_own" on public.manual_topup_requests;
create policy "manual_topup_requests_select_own" on public.manual_topup_requests
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "manual_topup_requests_admin_all" on public.manual_topup_requests;
create policy "manual_topup_requests_admin_all" on public.manual_topup_requests
  for all to service_role using (true);

alter table if exists public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_any" on public.contact_messages;
create policy "contact_messages_insert_any" on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_messages_admin_select" on public.contact_messages;
create policy "contact_messages_admin_select" on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_credits bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  delta_credits bigint not null,
  reason text not null,
  ref_type text,
  ref_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.razorpay_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text unique,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null default 'created',
  created_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb
);

create table if not exists public.razorpay_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_payment_id text not null unique,
  razorpay_order_id text,
  amount_paise integer not null,
  currency text not null default 'INR',
  status text not null,
  method text,
  email text,
  contact text,
  created_at timestamptz not null default now(),
  raw jsonb
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'open',
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on contact_messages(created_at desc);
create index if not exists contact_messages_status_idx on contact_messages(status);

create table if not exists public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),
  razorpay_event_id text unique,
  event text,
  created_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  storage_bucket text not null,
  storage_path text not null,
  filename text not null,
  mime_type text not null,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null,
  action text not null,
  credits_charged bigint not null default 0,
  file_id uuid references public.files(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create or replace function public.wallet_add_credits(
  p_user_id uuid,
  p_delta_credits bigint,
  p_reason text,
  p_ref_type text default null,
  p_ref_id text default null
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.wallets(user_id, balance_credits)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance_credits = balance_credits + p_delta_credits,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.wallet_ledger(user_id, delta_credits, reason, ref_type, ref_id)
  values (p_user_id, p_delta_credits, p_reason, p_ref_type, p_ref_id);
end;
$$;

create or replace function public.wallet_spend_credits(
  p_user_id uuid,
  p_cost_credits bigint,
  p_reason text,
  p_ref_type text default null,
  p_ref_id text default null
) returns boolean
language plpgsql
security definer
as $$
declare
  v_balance bigint;
begin
  insert into public.wallets(user_id, balance_credits)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance_credits into v_balance
  from public.wallets
  where user_id = p_user_id
  for update;

  if v_balance < p_cost_credits then
    return false;
  end if;

  update public.wallets
  set balance_credits = balance_credits - p_cost_credits,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.wallet_ledger(user_id, delta_credits, reason, ref_type, ref_id)
  values (p_user_id, -p_cost_credits, p_reason, p_ref_type, p_ref_id);

  return true;
end;
$$;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.admin_settings enable row level security;
alter table public.tool_pricing enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.razorpay_orders enable row level security;
alter table if exists public.razorpay_payments enable row level security;
alter table if exists public.contact_messages enable row level security;
alter table public.razorpay_webhook_events enable row level security;
alter table public.files enable row level security;
alter table public.tool_runs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own" on public.wallets
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "ledger_select_own" on public.wallet_ledger;
create policy "ledger_select_own" on public.wallet_ledger
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "files_select_own" on public.files;
create policy "files_select_own" on public.files
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tool_runs_select_own" on public.tool_runs;
create policy "tool_runs_select_own" on public.tool_runs
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_select_own" on public.razorpay_orders;
create policy "orders_select_own" on public.razorpay_orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_select_own" on public.razorpay_payments;
create policy "payments_select_own" on public.razorpay_payments
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "webhook_events_admin_only" on public.razorpay_webhook_events;
create policy "webhook_events_admin_only" on public.razorpay_webhook_events
  for select using (public.is_admin());

drop policy if exists "pricing_read_all" on public.tool_pricing;
create policy "pricing_read_all" on public.tool_pricing
  for select using (true);

drop policy if exists "admin_settings_admin_only" on public.admin_settings;
create policy "admin_settings_admin_only" on public.admin_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "pricing_admin_write" on public.tool_pricing;
create policy "pricing_admin_write" on public.tool_pricing
  for all using (public.is_admin()) with check (public.is_admin());

-- Tools Pricing
insert into public.tool_pricing (tool_id, download_credits) values 
('td_commission', 10),
('gds_leave', 5),
('letterpad_generator', 15)
on conflict (tool_id) do update set download_credits = excluded.download_credits;
-- Run this in Supabase SQL Editor

-- 1. Create a NEW bucket 'manual-topup-proofs'
-- Note: If this fails with permission error, create it via Dashboard UI first!
insert into storage.buckets (id, name, public)
values ('manual-topup-proofs', 'manual-topup-proofs', true)
on conflict (id) do update set public = true;

-- 2. Allow public access to read screenshots
create policy "Allow Public Read manual-topup-proofs"
on storage.objects for select
using ( bucket_id = 'manual-topup-proofs' );

-- 3. Allow authenticated users to upload to their own folder
create policy "Allow Auth Upload manual-topup-proofs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'manual-topup-proofs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Admin full access
create policy "Admin Full Access manual-topup-proofs"
on storage.objects for all
using ( bucket_id = 'manual-topup-proofs' )
with check ( bucket_id = 'manual-topup-proofs' );

-- Admin Settings for Payment
insert into public.admin_settings (key, value) values 
('payment_config', '{
  "method": "manual", 
  "razorpay_enabled": false,
  "manual_enabled": true,
  "upi_id": "swinfosystems@nyes",
  "credits_per_inr": 1
}'::jsonb)
on conflict (key) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');

  insert into public.wallets (user_id, balance_credits)
  values (new.id, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
