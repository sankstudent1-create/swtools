import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing RAZORPAY_WEBHOOK_SECRET')
  if (!signature) return false

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function creditsFromAmountPaise(amountPaise: number, creditsPerInr: number) {
  const inr = amountPaise / 100
  return Math.floor(inr * creditsPerInr)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature')

  let eventJson: any
  try {
    eventJson = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const ok = verifySignature(rawBody, signature)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const admin = createSupabaseAdminClient()

  const eventId = eventJson?.event_id || eventJson?.id
  const eventName = eventJson?.event

  if (eventId) {
    const ins = await admin.from('razorpay_webhook_events').insert({
      razorpay_event_id: String(eventId),
      event: eventName ? String(eventName) : null,
      raw: eventJson,
    })

    if (ins.error) {
      // already processed
      return NextResponse.json({ status: 'duplicate' })
    }
  }

  // Handle payment captured
  if (eventName === 'payment.captured') {
    const payment = eventJson?.payload?.payment?.entity
    const paymentId = payment?.id
    const orderId = payment?.order_id
    const amount = payment?.amount
    const currency = payment?.currency

    if (!paymentId || !orderId || !amount) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 })
    }

    const { data: orderRow, error: orderErr } = await admin
      .from('razorpay_orders')
      .select('user_id,amount_paise,status')
      .eq('razorpay_order_id', String(orderId))
      .maybeSingle()

    if (orderErr || !orderRow) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const paymentInsert = await admin.from('razorpay_payments').insert({
      user_id: orderRow.user_id,
      razorpay_payment_id: String(paymentId),
      razorpay_order_id: String(orderId),
      amount_paise: Number(amount),
      currency: currency ? String(currency) : 'INR',
      status: 'captured',
      raw: payment,
    })

    if (paymentInsert.error) {
      // payment already processed
      return NextResponse.json({ status: 'duplicate_payment' })
    }

    const { data: rateRow } = await admin
      .from('admin_settings')
      .select('value')
      .eq('key', 'credits_per_inr')
      .maybeSingle()

    const creditsPerInr = Number(rateRow?.value?.credits_per_inr ?? rateRow?.value ?? 1)
    const credits = creditsFromAmountPaise(Number(amount), creditsPerInr)

    await admin.rpc('wallet_add_credits', {
      p_user_id: orderRow.user_id,
      p_delta_credits: credits,
      p_reason: 'wallet_topup',
      p_ref_type: 'razorpay_payment',
      p_ref_id: String(paymentId),
    })

    await admin
      .from('razorpay_orders')
      .update({ status: 'paid' })
      .eq('razorpay_order_id', String(orderId))

    return NextResponse.json({ status: 'ok', credited: credits })
  }

  return NextResponse.json({ status: 'ignored' })
}
