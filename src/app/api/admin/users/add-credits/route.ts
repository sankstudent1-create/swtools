import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { isAdmin, supabase } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, credits } = await req.json()
  
  if (!userId || !credits) {
    return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 })
  }

  const { error } = await supabase.rpc('wallet_add_credits', {
    p_user_id: userId,
    p_delta_credits: credits,
    p_reason: 'admin_manual_add',
    p_ref_type: 'admin',
    p_ref_id: 'manual'
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
