import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { request_id, utr } = await req.json()
  if (!request_id || !utr) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('manual_topup_requests')
    .update({ utr: utr.trim() })
    .eq('id', request_id)

  if (error) {
    if (error.code === '23505') {
        return NextResponse.json({ error: 'This UTR has already been submitted by another request.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
