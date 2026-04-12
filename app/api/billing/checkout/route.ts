// app/api/billing/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

export async function POST(req: Request) {
  try {
    const { planId, billingCycle } = await req.json();
    
    // الحصول على المستخدم من التوكن
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const stripeInstance = getStripe();
    
    // إنشاء جلسة دفع
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `اشتراك ${plan.name} - ${billingCycle === 'monthly' ? 'شهري' : 'سنوي'}`,
              description: plan.description,
            },
            unit_amount: (billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly) * 100,
            recurring: {
              interval: billingCycle === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${req.headers.get('origin')}/?success=false`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId,
        billingCycle: billingCycle
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stripe Checkout Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
