import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

type ReplyBody = {
  id: string
  reply: string
  status?: 'open' | 'replied' | 'closed'
}

export async function POST(req: NextRequest) {
  const { isAdmin, user } = await requireAdmin()
  if (!isAdmin || !user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as ReplyBody
  const id = String(body?.id ?? '').trim()
  const reply = String(body?.reply ?? '').trim()
  const status = body?.status ?? 'replied'

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  if (!reply) return NextResponse.json({ error: 'Missing reply' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('contact_messages')
    .update({
      admin_reply: reply,
      status,
      replied_at: new Date().toISOString(),
      replied_by: user.id,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
