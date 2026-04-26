import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { request_id, amount_inr, credits_requested } = await req.json()
  if (!request_id || amount_inr === undefined) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('manual_topup_requests')
    .update({ 
      amount_inr: Number(amount_inr),
      credits_requested: Number(credits_requested)
    })
    .eq('id', request_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
