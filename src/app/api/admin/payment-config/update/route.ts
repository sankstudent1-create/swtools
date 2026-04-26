import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { method, razorpay_enabled, manual_enabled, upi_id, credits_per_inr } = body

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('admin_settings')
    .upsert({
      key: 'payment_config',
      value: {
        method,
        razorpay_enabled,
        manual_enabled,
        upi_id,
        credits_per_inr,
        updated_at: new Date().toISOString()
      }
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
