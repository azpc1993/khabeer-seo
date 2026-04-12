// app/api/billing/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    stripe = new Stripe(key);
  }
  return stripe;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    const stripeInstance = getStripe();
    event = stripeInstance.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // معالجة الأحداث
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId && planId) {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      // تحديث حالة الاشتراك إلى ملغي في قاعدة البيانات بناءً على customerId أو metadata
      console.log('Subscription deleted for customer:', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
