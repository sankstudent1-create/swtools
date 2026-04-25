import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type Body = {
  amount_inr: number
  utr: string
  credits_requested: number
  screenshot_path?: string | null
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as Body
    const amountInr = Number(body?.amount_inr)
    const utr = body?.utr ? String(body.utr).trim() : null
    const creditsRequested = Number(body?.credits_requested)
    const screenshotPath = body?.screenshot_path || null

    if (!Number.isFinite(amountInr) || amountInr <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }
    if (!utr && !screenshotPath) {
      return NextResponse.json({ error: 'Provide at least UTR or Screenshot' }, { status: 400 })
    }
    if (!Number.isFinite(creditsRequested) || creditsRequested <= 0) {
      return NextResponse.json({ error: 'Invalid credits' }, { status: 400 })
    }

    const ins = await supabase.from('manual_topup_requests').insert({
      user_id: user.id,
      amount_inr: amountInr,
      credits_requested: creditsRequested,
      utr: utr || `pending_ocr_${Date.now()}`,
      screenshot_path: screenshotPath,
      status: 'pending',
    })

    if (ins.error) {
      if (ins.error.code === '23505') {
        return NextResponse.json({ error: 'This UTR has already been submitted.' }, { status: 409 })
      }
      return NextResponse.json({ error: ins.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
