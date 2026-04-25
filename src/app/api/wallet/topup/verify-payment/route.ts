import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type Body = {
  razorpay_payment_id: string
}

async function fetchRazorpayPayment(paymentId: string) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET')
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
    cache: 'no-store',
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = json?.error?.description || json?.error?.code || json?.message || 'Razorpay API error'
    throw new Error(String(msg))
  }

  return json as any
}

function creditsFromAmountPaise(amountPaise: number, creditsPerInr: number) {
  const inr = amountPaise / 100
  return Math.floor(inr * creditsPerInr)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as Body
  const paymentId = String(body?.razorpay_payment_id || '').trim()

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing razorpay_payment_id' }, { status: 400 })
  }

  let payment: any
  try {
    payment = await fetchRazorpayPayment(paymentId)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to verify payment' }, { status: 500 })
  }

  const status = String(payment?.status || '')
  const amountPaise = Number(payment?.amount)
  const currency = String(payment?.currency || 'INR')

  if (currency !== 'INR') {
    return NextResponse.json({ error: 'Only INR payments are supported' }, { status: 400 })
  }

  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 })
  }

  if (status !== 'captured') {
    return NextResponse.json({ error: `Payment not captured (status: ${status || 'unknown'})` }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  // Insert payment record (unique on razorpay_payment_id) - ensures idempotency
  const ins = await admin.from('razorpay_payments').insert({
    user_id: auth.user.id,
    razorpay_payment_id: paymentId,
    razorpay_order_id: payment?.order_id ? String(payment.order_id) : null,
    amount_paise: amountPaise,
    currency,
    status: 'captured',
    raw: payment,
  })

  if (ins.error) {
    // Duplicate payment ID (already processed)
    if (String(ins.error.code) === '23505') {
      return NextResponse.json({ ok: true, status: 'duplicate' })
    }
    return NextResponse.json({ error: ins.error.message }, { status: 500 })
  }

  const { data: rateRow, error: rateErr } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'credits_per_inr')
    .maybeSingle()

  if (rateErr) {
    return NextResponse.json({ error: rateErr.message }, { status: 500 })
  }

  const creditsPerInr = Number(rateRow?.value?.credits_per_inr ?? rateRow?.value ?? 1)
  const credits = creditsFromAmountPaise(amountPaise, creditsPerInr)

  const creditRes = await admin.rpc('wallet_add_credits', {
    p_user_id: auth.user.id,
    p_delta_credits: credits,
    p_reason: 'wallet_topup',
    p_ref_type: 'razorpay_payment_link',
    p_ref_id: paymentId,
  })

  if (creditRes.error) {
    return NextResponse.json({ error: creditRes.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: 'credited', credited: credits, amount_paise: amountPaise })
}
