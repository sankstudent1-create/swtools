import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type Body = {
  name: string
  email: string
  phone: string
  message: string
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const phone = String(body?.phone ?? '').trim()
  const message = String(body?.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 })
  }

  if (name.length > 120) return NextResponse.json({ error: 'Name too long' }, { status: 400 })
  if (email.length > 200) return NextResponse.json({ error: 'Email too long' }, { status: 400 })
  if (phone.length > 40) return NextResponse.json({ error: 'Phone too long' }, { status: 400 })
  if (message.length > 4000) return NextResponse.json({ error: 'Message too long' }, { status: 400 })

  const admin = createSupabaseAdminClient()
  const ins = await admin.from('contact_messages').insert({
    user_id: auth.user?.id ?? null,
    name,
    email,
    phone: phone || null,
    message,
    status: 'open',
  })

  if (ins.error) {
    return NextResponse.json({ error: ins.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
