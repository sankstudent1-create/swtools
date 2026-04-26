import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('tool_pricing')
    .select('*')
    .order('tool_id', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { tool_id, download_credits, is_active } = await req.json()
  if (!tool_id) return NextResponse.json({ error: 'Missing tool_id' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('tool_pricing')
    .upsert({
      tool_id,
      download_credits: Number(download_credits),
      is_active: Boolean(is_active),
      updated_at: new Date().toISOString()
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
