import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type Body = {
  credits_per_inr: number
}

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('admin_settings')
    .select('value,updated_at')
    .eq('key', 'credits_per_inr')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const creditsPerInr = Number(data?.value?.credits_per_inr ?? data?.value ?? 1)
  return NextResponse.json({ credits_per_inr: creditsPerInr, updated_at: data?.updated_at ?? null })
}

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as Body
  const v = Number(body.credits_per_inr)
  if (!Number.isFinite(v) || v <= 0) {
    return NextResponse.json({ error: 'Invalid credits_per_inr' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const up = await admin.from('admin_settings').upsert({
    key: 'credits_per_inr',
    value: { credits_per_inr: v },
  })

  if (up.error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
