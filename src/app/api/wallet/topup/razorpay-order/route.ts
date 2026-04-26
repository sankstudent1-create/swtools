import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
const Razorpay = require('razorpay')

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amount_inr } = await req.json()
  if (!amount_inr || amount_inr < 1) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

  if (!razorpayKeyId || !razorpaySecret) {
    return NextResponse.json({ error: 'Razorpay not configured on server' }, { status: 500 })
  }

  try {
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    })

    const options = {
      amount: Math.round(amount_inr * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        userEmail: user.email
      }
    }

    const order = await razorpay.orders.create(options)

    // Log to DB
    await supabase.from('razorpay_orders').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount_paise: options.amount,
      currency: 'INR',
      status: 'created',
      raw: order
    })

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKeyId
    })
  } catch (error: any) {
    console.error('Razorpay Order Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
