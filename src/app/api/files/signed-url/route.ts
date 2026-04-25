import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type Body = {
  file_id: string
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body
  if (!body.file_id) {
    return NextResponse.json({ error: 'file_id is required' }, { status: 400 })
  }

  // Ensure user owns the file (RLS on select)
  const { data: fileRow, error: fileErr } = await supabase
    .from('files')
    .select('id,storage_bucket,storage_path,filename')
    .eq('id', body.file_id)
    .maybeSingle()

  if (fileErr || !fileRow) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const admin = createSupabaseAdminClient()
  const signed = await admin.storage
    .from(fileRow.storage_bucket)
    .createSignedUrl(fileRow.storage_path, 60)

  if (signed.error || !signed.data?.signedUrl) {
    return NextResponse.json({ error: 'Could not create signed URL' }, { status: 500 })
  }

  return NextResponse.json({
    url: signed.data.signedUrl,
    filename: fileRow.filename,
  })
}
