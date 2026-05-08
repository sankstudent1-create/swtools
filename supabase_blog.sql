create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content_json jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  cover_image_url text,
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}'::text[],
  canonical_path text
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts(status, published_at desc);

create index if not exists blog_posts_category_idx
  on public.blog_posts(category_id);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.blog_comments(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_idx on public.blog_comments(post_id, created_at asc);

alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;

drop policy if exists "blog_categories_read_all" on public.blog_categories;
create policy "blog_categories_read_all" on public.blog_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "blog_categories_admin_write" on public.blog_categories;
create policy "blog_categories_admin_write" on public.blog_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_posts_read_published" on public.blog_posts;
create policy "blog_posts_read_published" on public.blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write" on public.blog_posts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "blog_comments_read_published" on public.blog_comments;
create policy "blog_comments_read_published" on public.blog_comments
  for select
  to anon, authenticated
  using (
    exists(
      select 1 from public.blog_posts p
      where p.id = blog_comments.post_id and p.status = 'published'
    )
  );

drop policy if exists "blog_comments_insert_auth" on public.blog_comments;
create policy "blog_comments_insert_auth" on public.blog_comments
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists(
      select 1 from public.blog_posts p
      where p.id = post_id and p.status = 'published'
    )
  );

drop policy if exists "blog_comments_admin_moderate" on public.blog_comments;
create policy "blog_comments_admin_moderate" on public.blog_comments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
