import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { buildTDCommissionPdfBytes } from '@/lib/td-commission/serverPdf'
import type { EntryRow, OfficeDetails } from '@/types/td-commission'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

type Body = {
  office: OfficeDetails
  rows: EntryRow[]
}

const STORAGE_BUCKET = 'user-files'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body

  const { data: pricingRow } = await supabase
    .from('tool_pricing')
    .select('download_credits,is_active')
    .eq('tool_id', 'td_commission')
    .maybeSingle()

  const downloadCredits = pricingRow?.download_credits ?? 10
  const isActive = pricingRow?.is_active ?? true

  if (!isActive) {
    return NextResponse.json({ error: 'Tool is currently unavailable' }, { status: 503 })
  }

  const { data: spent, error: spendError } = await supabase.rpc('wallet_spend_credits', {
    p_user_id: auth.user.id,
    p_cost_credits: downloadCredits,
    p_reason: 'td_commission_download',
    p_ref_type: 'tool',
    p_ref_id: 'td_commission',
  })

  if (spendError) {
    console.error('[td_commission] wallet_spend_credits error', spendError)
    return NextResponse.json({ error: 'Wallet error' }, { status: 500 })
  }

  if (!spent) {
    return NextResponse.json(
      { error: 'Insufficient credits', required_credits: downloadCredits },
      { status: 402 }
    )
  }

  const pdfBytes = await buildTDCommissionPdfBytes({
    office: body.office,
    rows: body.rows,
    watermark: 'none',
  })

  const admin = createSupabaseAdminClient()
  const fileId = randomUUID()
  const storagePath = `${auth.user.id}/td_commission/${fileId}.pdf`

  const uploadRes = await admin.storage.from(STORAGE_BUCKET).upload(storagePath, pdfBytes, {
    contentType: 'application/pdf',
    upsert: false,
  })

  if (uploadRes.error) {
    console.error('[td_commission] upload error', uploadRes.error)
    await supabase.rpc('wallet_add_credits', {
      p_user_id: auth.user.id,
      p_delta_credits: downloadCredits,
      p_reason: 'refund_upload_failed',
      p_ref_type: 'tool',
      p_ref_id: 'td_commission',
    })
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
  }

  const filename = 'TD_Commission.pdf'

  const { data: fileRow, error: fileErr } = await admin
    .from('files')
    .insert({
      user_id: auth.user.id,
      tool_id: 'td_commission',
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
      filename,
      mime_type: 'application/pdf',
      size_bytes: pdfBytes.length,
    })
    .select('id')
    .single()

  if (fileErr) {
    console.error('[td_commission] files insert error', fileErr)
  }

  await admin.from('tool_runs').insert({
    user_id: auth.user.id,
    tool_id: 'td_commission',
    action: 'download',
    credits_charged: downloadCredits,
    file_id: fileRow?.id ?? null,
    meta: { rows: body.rows?.length ?? 0 },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
