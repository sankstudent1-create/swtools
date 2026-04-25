import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { buildTDCommissionPdfBytes } from '@/lib/td-commission/serverPdf'
import type { EntryRow, OfficeDetails } from '@/types/td-commission'

export const runtime = 'nodejs'

type Body = {
  office: OfficeDetails
  rows: EntryRow[]
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body

  const pdfBytes = await buildTDCommissionPdfBytes({
    office: body.office,
    rows: body.rows,
    watermark: 'preview',
  })

  await supabase.from('tool_runs').insert({
    user_id: auth.user.id,
    tool_id: 'td_commission',
    action: 'preview',
    credits_charged: 0,
    meta: { rows: body.rows?.length ?? 0 },
    ip: req.headers.get('x-forwarded-for') ?? null,
    user_agent: req.headers.get('user-agent') ?? null,
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-store',
    },
  })
}
