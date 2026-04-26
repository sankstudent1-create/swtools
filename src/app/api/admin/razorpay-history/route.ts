import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  
  // Fetch from razorpay_payments and join with profiles
  const { data: payments, error } = await admin
    .from('razorpay_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const userIds = Array.from(new Set((payments ?? []).map((p: any) => p.user_id).filter(Boolean)))
  let profilesById = new Map<string, any>()
  if (userIds.length > 0) {
    const { data: profiles, error: profErr } = await admin
      .from('profiles')
      .select('id,email,full_name')
      .in('id', userIds)

    if (!profErr && profiles) {
      profilesById = new Map(profiles.map((p: any) => [p.id, p]))
    }
  }

  const merged = (payments ?? []).map((p: any) => ({
    ...p,
    profiles: profilesById.get(p.user_id) ?? null,
  }))

  return NextResponse.json({ history: merged })
}
