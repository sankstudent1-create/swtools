import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function requireUser() {
  const supabase = createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { supabase, user: null }
  return { supabase, user: auth.user }
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser()
  if (!user) return { supabase, user: null, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return { supabase, user, isAdmin: profile?.role === 'admin' }
}
