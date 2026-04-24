import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  if (typeof window !== 'undefined') {
    console.error('CRITICAL: Supabase server env vars missing.');
    alert('Configuration Error: Supabase server credentials missing.');
  }
}

export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRole || 'placeholder'
);
