import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabaseServer } from '@/utils/supabase/server';

export async function POST(req: Request) {
  console.log('=== Razorpay POST handler started ===');
  
  try {
    console.log('Step 1: Parsing request body...');
    const supabase = supabaseServer;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('TD Commission: No user found, redirecting to login');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Refresh latest profile to get up‑to‑date credits
    const { data: latestProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();
    if (profileErr) {
      console.error('Failed to fetch latest profile:', profileErr);
    }

    const body = await req.json();
    console.log('Step 2: Request received:', body);
    
    const { amount, credits, userId } = body;

    console.log('Step 3: Checking required fields...');
    if (!amount || !credits || !userId) {
      console.error('Missing required fields:', { amount, credits, userId });
      return NextResponse.json({ error: "Missing required fields: amount, credits, or userId" }, { status: 400 });
    }

    console.log('Step 4: Checking environment variables...');
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('Environment check:', { 
      hasKeyId: !!keyId, 
      hasKeySecret: !!keySecret,
      keyIdLength: keyId?.length,
      keySecretLength: keySecret?.length
    });

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing', { keyId: !!keyId, keySecret: !!keySecret });
      return NextResponse.json({ error: "Server configuration error: Razorpay credentials not set" }, { status: 500 });
    }

    console.log('Step 5: Initializing Razorpay...');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId,
        credits
      }
    };

    console.log('Step 6: Creating Razorpay order with options:', options);
    try {
      const order = await razorpay.orders.create(options);
      console.log('Step 7: Order created successfully:', order.id);
      // Return only necessary fields to client
      return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency });
    } catch (orderErr) {
      console.error('Razorpay order creation failed:', orderErr);
      return NextResponse.json({ error: 'Failed to create Razorpay order', details: orderErr?.message || '' }, { status: 500 });
    }  } catch (error: any) {
    console.error('=== Razorpay order error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error statusCode:', error.statusCode);
    console.error('Error details:', error.error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 });
  }
}
