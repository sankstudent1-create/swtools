import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

const STORAGE_BUCKET = 'user-files'
const TOOL_ID = 'letterpad_generator'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action, pdfBase64, filename, storagePath, sizeBytes } = body // action: 'download' or 'ai_fill'

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
  let fileId: string | null = null

  const safeFilename = filename || `Letterpad_${Date.now()}.pdf`

  if (action === 'download' && storagePath) {
    if (typeof storagePath !== 'string' || !storagePath.startsWith(`${auth.user.id}/`)) {
      return NextResponse.json({ error: 'Invalid storagePath' }, { status: 400 })
    }

    const { data: fileRow, error: fileError } = await admin
      .from('files')
      .insert({
        user_id: auth.user.id,
        tool_id: TOOL_ID,
        storage_bucket: STORAGE_BUCKET,
        storage_path: storagePath,
        filename: safeFilename,
        mime_type: 'application/pdf',
        size_bytes: typeof sizeBytes === 'number' ? sizeBytes : null,
      })
      .select('id')
      .single()

    if (!fileError) fileId = fileRow.id
  }

  // If it's a download and we have PDF data, save it to storage
  if (action === 'download' && !fileId && pdfBase64) {
    try {
      const buffer = Buffer.from(pdfBase64, 'base64')
      const path = `${auth.user.id}/${TOOL_ID}_${Date.now()}.pdf`
      
      const { data: uploadData, error: uploadError } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (!uploadError && uploadData) {
        const { data: fileRow, error: fileError } = await admin
          .from('files')
          .insert({
            user_id: auth.user.id,
            tool_id: TOOL_ID,
            storage_bucket: STORAGE_BUCKET,
            storage_path: path,
            filename: safeFilename,
            mime_type: 'application/pdf',
            size_bytes: buffer.length
          })
          .select('id')
          .single()
        
        if (!fileError) fileId = fileRow.id
      }
    } catch (e) {
      console.error('File save error:', e)
    }
  }

  await admin.from('tool_runs').insert({
    user_id: auth.user.id,
    tool_id: TOOL_ID,
    action: action,
    credits_charged: cost,
    file_id: fileId,
    meta: { ...body.meta },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return NextResponse.json({ ok: true, file_id: fileId })
}
