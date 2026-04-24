import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  
  // Use Razorpay Secret as fallback if WEBHOOK_SECRET is not explicitly set
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_SECRET;

  if (!webhookSecret || !signature) {
    console.error('Razorpay webhook verification failed: Secret or signature missing');
    return NextResponse.json({ error: 'Configuration missing' }, { status: 400 });
  }

  // 1. Verify Webhook Signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  const payload = JSON.parse(body);
  const supabase = createClient();

  // 2. Handle Payment Success
  if (payload.event === 'payment.captured') {
    const { amount, notes } = payload.payload.payment.entity;
    const userId = notes.user_id;
    const creditsToAt = parseInt(notes.credits);

    // Update wallet balance atomically
    const { data: profile, error: profileError } = await (await supabase)
      .from('profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (!profileError && profile) {
      await (await supabase)
        .from('profiles')
        .update({ wallet_balance: profile.wallet_balance + creditsToAt })
        .eq('id', userId);

      // Log transaction
      await (await supabase).from('transactions').insert({
        user_id: userId,
        amount: amount / 100, // Convert from paise
        credits: creditsToAt,
        provider_payment_id: payload.payload.payment.entity.id,
        status: 'completed'
      });
    }
  }

  return NextResponse.json({ received: true });
}
