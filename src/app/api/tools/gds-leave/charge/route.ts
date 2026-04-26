import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

const STORAGE_BUCKET = 'user-files'
const TOOL_ID = 'gds_leave'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { data: pricingRow } = await supabase
    .from('tool_pricing')
    .select('download_credits,is_active')
    .eq('tool_id', TOOL_ID)
    .maybeSingle()

  const downloadCredits = pricingRow?.download_credits ?? 5
  const isActive = pricingRow?.is_active ?? true

  if (!isActive) {
    return NextResponse.json({ error: 'Tool is currently unavailable' }, { status: 503 })
  }

  const { data: spent, error: spendError } = await supabase.rpc('wallet_spend_credits', {
    p_user_id: auth.user.id,
    p_cost_credits: downloadCredits,
    p_reason: `${TOOL_ID}_download`,
    p_ref_type: 'tool',
    p_ref_id: TOOL_ID,
  })

  if (spendError) {
    console.error(`[${TOOL_ID}] wallet_spend_credits error`, spendError)
    return NextResponse.json({ error: 'Wallet error' }, { status: 500 })
  }

  if (!spent) {
    return NextResponse.json(
      { error: 'Insufficient credits', required_credits: downloadCredits },
      { status: 402 }
    )
  }

  // We return success so the client can proceed with the local PDF generation/print
  // Since GDS Leave uses browser-side HTML-to-PDF, we just charge here.
  
  const admin = createSupabaseAdminClient()
  await admin.from('tool_runs').insert({
    user_id: auth.user.id,
    tool_id: TOOL_ID,
    action: 'download',
    credits_charged: downloadCredits,
    meta: { tab: body.tab || 'app' },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return NextResponse.json({ ok: true })
}
