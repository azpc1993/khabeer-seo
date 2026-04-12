// services/stripeService.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export const stripeService = {
  async createCheckoutSession(planId: string, billingCycle: 'monthly' | 'yearly') {
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, billingCycle }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw error;
    }
  }
};
