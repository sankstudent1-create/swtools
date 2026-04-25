import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Body = {
  amount_inr: number
  utr: string
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body
  const amountInr = Number(body?.amount_inr)
  const utr = String(body?.utr || '').trim()

  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }
  if (!utr || utr.length < 6) {
    return NextResponse.json({ error: 'Invalid UTR' }, { status: 400 })
  }

  const ins = await supabase.from('manual_topup_requests').insert({
    user_id: auth.user.id,
    amount_inr: amountInr,
    utr,
    status: 'pending',
  })

  if (ins.error) {
    return NextResponse.json({ error: ins.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
