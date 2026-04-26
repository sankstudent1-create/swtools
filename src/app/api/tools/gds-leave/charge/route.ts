import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const STORAGE_BUCKET = 'user-files'
const TOOL_ID = 'gds_leave'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = req.headers.get('content-type') || ''

  let tab: string | undefined
  let pdfBase64: string | undefined
  let filename: string | undefined
  let storagePath: string | undefined
  let sizeBytes: number | undefined
  let uploadedFileBytes: Buffer | null = null

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    tab = (form.get('tab') as string) || undefined
    filename = (form.get('filename') as string) || undefined
    const sb = form.get('sizeBytes')
    sizeBytes = typeof sb === 'string' ? Number(sb) : undefined

    const file = form.get('file')
    if (file && typeof file !== 'string') {
      const ab = await (file as File).arrayBuffer()
      uploadedFileBytes = Buffer.from(ab)
      if (!sizeBytes) sizeBytes = uploadedFileBytes.length
      if (!filename) filename = (file as File).name || undefined
    }
  } else {
    const body = await req.json()
    tab = body.tab
    pdfBase64 = body.pdfBase64
    filename = body.filename
    storagePath = body.storagePath
    sizeBytes = body.sizeBytes
  }

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

  const admin = createSupabaseAdminClient()
  let fileId: string | null = null

  const safeFilename = filename || `GDS_Leave_${Date.now()}.pdf`

  if (uploadedFileBytes) {
    try {
      const path = `${auth.user.id}/gds_leave/${Date.now()}.pdf`
      const uploadRes = await admin.storage.from(STORAGE_BUCKET).upload(path, uploadedFileBytes, {
        contentType: 'application/pdf',
        upsert: false,
      })

      if (uploadRes.error) {
        console.error('[gds_leave] upload error', uploadRes.error)
      } else {
        const { data: fileRow, error: fileError } = await admin
          .from('files')
          .insert({
            user_id: auth.user.id,
            tool_id: TOOL_ID,
            storage_bucket: STORAGE_BUCKET,
            storage_path: path,
            filename: safeFilename,
            mime_type: 'application/pdf',
            size_bytes: uploadedFileBytes.length,
          })
          .select('id')
          .single()

        if (!fileError) fileId = fileRow.id
      }
    } catch (e) {
      console.error('[gds_leave] server upload error', e)
    }
  }

  if (storagePath) {
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

  if (!fileId && pdfBase64) {
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
    action: 'download',
    credits_charged: downloadCredits,
    file_id: fileId,
    meta: { tab: tab || 'app' },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return NextResponse.json({ ok: true, file_id: fileId })
}
