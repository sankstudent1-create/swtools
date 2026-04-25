import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type Body = {
  download_credits: number
  is_active?: boolean
}

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('tool_pricing')
    .select('tool_id,download_credits,is_active,updated_at')
    .eq('tool_id', 'td_commission')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    tool_id: 'td_commission',
    download_credits: data?.download_credits ?? 10,
    is_active: data?.is_active ?? true,
    updated_at: data?.updated_at ?? null,
  })
}

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json()) as Body
  const credits = Number(body.download_credits)
  if (!Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ error: 'Invalid download_credits' }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const up = await admin.from('tool_pricing').upsert({
    tool_id: 'td_commission',
    download_credits: Math.floor(credits),
    is_active: body.is_active ?? true,
  })

  if (up.error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
