import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET() {
  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'payment_config')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fallback if not set
  const defaultConfig = {
    method: 'manual',
    razorpay_enabled: false,
    manual_enabled: true,
    upi_id: 'swinfosystems@nyes',
    credits_per_inr: 1
  }

  const config = data?.value || defaultConfig

  // Check env for Razorpay keys to see if it's actually usable
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

  return NextResponse.json({
    ...config,
    razorpay_available: !!(razorpayKeyId && razorpaySecret)
  })
}
