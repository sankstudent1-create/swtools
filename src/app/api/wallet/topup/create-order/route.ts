import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createRazorpayClient } from '@/lib/razorpay'

export const runtime = 'nodejs'

type Body = {
  amount_inr: number
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body

  const amountInr = Number(body.amount_inr)
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const amountPaise = Math.round(amountInr * 100)

  const razorpay = createRazorpayClient()

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: `wallet_${auth.user.id}_${Date.now()}`,
    notes: {
      user_id: auth.user.id,
      purpose: 'wallet_topup',
    },
  })

  const admin = createSupabaseAdminClient()
  await admin.from('razorpay_orders').insert({
    user_id: auth.user.id,
    razorpay_order_id: order.id,
    amount_paise: amountPaise,
    currency: 'INR',
    status: 'created',
    raw: order,
  })

  return NextResponse.json({
    order_id: order.id,
    amount_paise: amountPaise,
    currency: 'INR',
    key_id: process.env.RAZORPAY_KEY_ID,
  })
}
