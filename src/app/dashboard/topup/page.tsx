import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import TopupClient from './TopupClient'

export const runtime = 'nodejs'

export default async function TopupPage() {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect(`/auth/login?next=${encodeURIComponent('/dashboard/topup')}`)
  }

  return <TopupClient userId={auth.user.id} userEmail={auth.user.email ?? null} />
}
