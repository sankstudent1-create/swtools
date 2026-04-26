import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature,
    amount_inr,
    credits
  } = await req.json()

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
  if (!razorpaySecret) {
    return NextResponse.json({ error: 'Razorpay secret missing' }, { status: 500 })
  }

  // 1. Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(body.toString())
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // 2. Fetch Order from DB to verify amount and expected credits
    const { data: dbOrder, error: dbOrderErr } = await supabase
      .from('razorpay_orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (dbOrderErr || !dbOrder) {
      return NextResponse.json({ error: 'Order not found in records' }, { status: 404 })
    }

    if (dbOrder.status === 'paid') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 })
    }

    // Verify amount in paise matches our record
    const expectedPaise = Math.round(amount_inr * 100)
    if (dbOrder.amount_paise !== expectedPaise) {
       return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // 3. Log Payment
    await supabase.from('razorpay_payments').insert({
      user_id: user.id,
      razorpay_payment_id,
      razorpay_order_id,
      amount_paise: dbOrder.amount_paise,
      currency: 'INR',
      status: 'captured',
      raw: { signature: razorpay_signature, client_credits: credits }
    })

    // 4. Update Order Status
    await supabase
      .from('razorpay_orders')
      .update({ status: 'paid' })
      .eq('razorpay_order_id', razorpay_order_id)

    // 5. Add Credits via RPC - ALWAYS use server-calculated expected credits
    const { error: creditErr } = await supabase.rpc('wallet_add_credits', {
      p_user_id: user.id,
      p_delta_credits: dbOrder.credits_expected || 0,
      p_reason: 'razorpay_topup',
      p_ref_type: 'razorpay_payment',
      p_ref_id: razorpay_payment_id
    })

    if (creditErr) {
      console.error('Credit Add Error:', creditErr)
      return NextResponse.json({ error: 'Payment verified but credit addition failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Razorpay Verification Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
