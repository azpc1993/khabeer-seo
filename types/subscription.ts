// types/subscription.ts

export type PlanId = 'free' | 'basic' | 'pro' | 'advanced';

export interface PlanLimits {
  analysesPerMonth: number;
  generationsPerMonth: number;
  savedProductsLimit: number;
  historyLimit: number;
  features: {
    autoSeo: boolean;
    contentGap: boolean;
    dashboard: boolean;
    faq: boolean;
    keywordInsights: boolean;
    competitorAnalysis: boolean;
    advancedExport: boolean;
  };
}

export interface Plan {
  id: PlanId;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  limits: PlanLimits;
  isRecommended?: boolean;
  stripePriceId?: {
    monthly: string;
    yearly: string;
  };
}

export interface UserSubscription {
  planId: PlanId;
  status: 'active' | 'trialing' | 'expired' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialUsed: boolean;
}

export interface UserUsage {
  analysesCount: number;
  generationsCount: number;
  savedProductsCount: number;
  historyCount: number;
  lastResetDate: string;
}
