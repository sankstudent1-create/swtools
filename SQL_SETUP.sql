-- SW TOOLS DATABASE INITIALIZATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO ENSURE TABLES AND POLICIES ARE CORRECTLY SET UP

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  wallet_balance BIGINT DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- 2. SYSTEM_CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.system_config (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Config Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to config' AND tablename = 'system_config') THEN
    CREATE POLICY "Allow public read access to config" ON public.system_config FOR SELECT USING (true);
  END IF;
END $$;

-- Seed default config if empty
INSERT INTO public.system_config (key, value)
VALUES 
  ('tool_costs', '{"letterpad": 5, "td_commission": 10, "gds_leave": 8}'::jsonb),
  ('credit_packages', '[{"credits": 100, "price": 99}, {"credits": 500, "price": 399}, {"credits": 1000, "price": 699}]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. USAGE_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Index for performance (Crucial for Dashboard Speed)
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at DESC);

-- Usage Log Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own logs' AND tablename = 'usage_logs') THEN
    CREATE POLICY "Users can view their own logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. USER_FILES TABLE
CREATE TABLE IF NOT EXISTS public.user_files (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_created_at ON public.user_files(created_at DESC);

-- File Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own files' AND tablename = 'user_files') THEN
    CREATE POLICY "Users can view their own files" ON public.user_files FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. FUNCTION TO AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wallet_balance)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
