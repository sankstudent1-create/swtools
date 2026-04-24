import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Razorpay order request received:', body);
    
    const { amount, credits, userId } = body;

    if (!amount || !credits || !userId) {
      console.error('Missing required fields:', { amount, credits, userId });
      return NextResponse.json({ error: "Missing required fields: amount, credits, or userId" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials missing', { keyId: !!keyId, keySecret: !!keySecret });
      return NextResponse.json({ error: "Server configuration error: Razorpay credentials not set" }, { status: 500 });
    }

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

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order.id);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      error: error.error
    });
    return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 });
  }
}
