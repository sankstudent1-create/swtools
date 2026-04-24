-- Supabase Schema for SWTools Wallet & Usage System

-- 1. Profiles Table (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  wallet_balance INTEGER DEFAULT 0 CHECK (wallet_balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table (Top-ups via Razorpay)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  credits INTEGER NOT NULL,
  provider TEXT DEFAULT 'razorpay',
  provider_payment_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Usage Records (Spending credits on tools)
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  metadata JSONB, -- Stores things like 'ai_calls_count', 'file_name', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Files (Saved generated files that users can re-view but not edit)
CREATE TABLE user_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  metadata JSONB, -- Stores form data used to generate the file
  is_locked BOOLEAN DEFAULT TRUE, -- Users can't edit once credit is deducted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. System Configuration (Dynamic Pricing & Costs)
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Config Data
INSERT INTO system_config (key, value) VALUES 
('credit_packages', '[
  {"credits": 50, "price": 49, "popular": false, "bonus": 0},
  {"credits": 120, "price": 99, "popular": true, "bonus": 20},
  {"credits": 300, "price": 199, "popular": false, "bonus": 50},
  {"credits": 1000, "price": 499, "popular": false, "bonus": 200}
]'),
('tool_costs', '{
  "letterpad_ai_fill": 5,
  "td_commission_download": 10,
  "gds_leave_download": 10,
  "pdf_editor_pro": 2
}');

-- Row Level Security (RLS) for Config
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view config" ON system_config FOR SELECT USING (true);
CREATE POLICY "Only admins can update config" ON system_config FOR UPDATE USING (auth.jwt() ->> 'email' = 'your_admin_email@example.com');
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage logs" ON usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own files" ON user_files FOR SELECT USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, wallet_balance)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 10); -- 10 Free welcome credits
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
