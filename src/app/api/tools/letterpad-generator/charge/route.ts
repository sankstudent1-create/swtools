import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const TOOL_ID = 'letterpad_generator'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action } = body // 'download' or 'ai_fill'

  const { data: pricingRow } = await supabase
    .from('tool_pricing')
    .select('download_credits,is_active')
    .eq('tool_id', TOOL_ID)
    .maybeSingle()

  const downloadCredits = pricingRow?.download_credits ?? 15
  const isActive = pricingRow?.is_active ?? true

  if (!isActive) {
    return NextResponse.json({ error: 'Tool is currently unavailable' }, { status: 503 })
  }

  // Charge more for AI fill if needed, or same for download
  const cost = action === 'ai_fill' ? 5 : downloadCredits

  const { data: spent, error: spendError } = await supabase.rpc('wallet_spend_credits', {
    p_user_id: auth.user.id,
    p_cost_credits: cost,
    p_reason: `${TOOL_ID}_${action}`,
    p_ref_type: 'tool',
    p_ref_id: TOOL_ID,
  })

  if (spendError) {
    console.error(`[${TOOL_ID}] wallet_spend_credits error`, spendError)
    return NextResponse.json({ error: 'Wallet error' }, { status: 500 })
  }

  if (!spent) {
    return NextResponse.json(
      { error: 'Insufficient credits', required_credits: cost },
      { status: 402 }
    )
  }

  const admin = createSupabaseAdminClient()
  await admin.from('tool_runs').insert({
    user_id: auth.user.id,
    tool_id: TOOL_ID,
    action: action,
    credits_charged: cost,
    meta: { ...body.meta },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return NextResponse.json({ ok: true })
}
