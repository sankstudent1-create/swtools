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

  try {
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          error:
            'Payments are not configured on this deployment. Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET in environment variables (Preview deployments need them too).',
        },
        { status: 500 }
      )
    }

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
    const ins = await admin.from('razorpay_orders').insert({
      user_id: auth.user.id,
      razorpay_order_id: order.id,
      amount_paise: amountPaise,
      currency: 'INR',
      status: 'created',
      raw: order,
    })

    if (ins.error) {
      console.error('[wallet topup] razorpay_orders insert failed', ins.error)
      return NextResponse.json({ error: 'Could not save order' }, { status: 500 })
    }

    return NextResponse.json({
      order_id: order.id,
      amount_paise: amountPaise,
      currency: 'INR',
      key_id: keyId,
    })
  } catch (err) {
    console.error('[wallet topup] create-order failed', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}
