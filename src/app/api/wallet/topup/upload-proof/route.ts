import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const amount = formData.get('amount')
    const utr = formData.get('utr')
    const credits = formData.get('credits')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const admin = createSupabaseAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // 1. Upload using Admin Client to bypass all client-side RLS/Auth issues
    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('manual-topup-proofs')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadErr) {
      console.error('[upload-api] Storage error:', uploadErr)
      return NextResponse.json({ error: `Storage failed: ${uploadErr.message}` }, { status: 500 })
    }

    // 3. Attempt Server-Side OCR immediately
    let detectedUtr = utr
    try {
      const publicUrl = admin.storage.from('manual-topup-proofs').getPublicUrl(fileName).data.publicUrl
      console.log('[upload-api] Starting background OCR for:', publicUrl)
      
      const ocrRes = await fetch(`${req.nextUrl.origin}/api/admin/topup-requests/ocr`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '' // Pass cookies for admin auth
        },
        body: JSON.stringify({ imageUrl: publicUrl })
      })
      
      if (ocrRes.ok) {
        const ocrData = await ocrRes.json()
        if (ocrData.utr) {
          console.log('[upload-api] OCR detected UTR:', ocrData.utr)
          detectedUtr = ocrData.utr
        }
      }
    } catch (ocrErr) {
      console.error('[upload-api] Background OCR failed:', ocrErr)
    }

    // 4. Create DB Record with detected UTR
    const { error: dbErr } = await admin.from('manual_topup_requests').insert({
      user_id: user.id,
      amount_inr: Number(amount),
      credits_requested: Number(credits),
      utr: detectedUtr || utr || `pending_ocr_${Date.now()}`,
      screenshot_path: fileName,
      status: 'pending'
    })

    if (dbErr) {
      console.error('[upload-api] DB error:', dbErr)
      return NextResponse.json({ error: `Database failed: ${dbErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, path: fileName })
  } catch (e: any) {
    console.error('[upload-api] Catch-all error:', e)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}
