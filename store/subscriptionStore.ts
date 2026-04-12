// store/subscriptionStore.ts
import { atom } from 'jotai';
import { UserSubscription, UserUsage } from '@/types/subscription';
import { PLANS } from '@/lib/plans';

// الحالة الافتراضية للمستخدم الجديد (تجربة مجانية لمدة 7 أيام لجميع الميزات)
const DEFAULT_SUBSCRIPTION: UserSubscription = {
  planId: 'advanced',
  status: 'trialing',
  currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false,
  trialUsed: true,
};

const DEFAULT_USAGE: UserUsage = {
  analysesCount: 0,
  generationsCount: 0,
  savedProductsCount: 0,
  historyCount: 0,
  lastResetDate: new Date().toISOString(),
};

export const subscriptionAtom = atom<UserSubscription>(DEFAULT_SUBSCRIPTION);
export const usageAtom = atom<UserUsage>(DEFAULT_USAGE);

// Atoms مشتقة للسهولة
export const currentPlanAtom = atom((get) => {
  const sub = get(subscriptionAtom);
  const now = new Date();
  const periodEnd = new Date(sub.currentPeriodEnd);
  
  // إذا انتهى الاشتراك أو التجربة، نعود للباقة المجانية
  if (sub.planId !== 'free' && periodEnd < now) {
    return PLANS[0];
  }
  
  return PLANS.find(p => p.id === sub.planId) || PLANS[0];
});

export const isSubscriptionExpiredAtom = atom((get) => {
  const sub = get(subscriptionAtom);
  if (sub.planId === 'free') return false;
  
  const now = new Date();
  const periodEnd = new Date(sub.currentPeriodEnd);
  return periodEnd < now;
});

export const isFeatureLockedAtom = atom((get) => (featureKey: keyof UserUsage | string) => {
  const plan = get(currentPlanAtom);
  const usage = get(usageAtom);
  const isExpired = get(isSubscriptionExpiredAtom);

  if (isExpired) return true;
  if (typeof featureKey === 'string' && featureKey in plan.limits.features) {
    return !plan.limits.features[featureKey as keyof typeof plan.limits.features];
  }

  // التحقق من الحدود العددية
  switch (featureKey) {
    case 'analysesCount':
      return usage.analysesCount >= plan.limits.analysesPerMonth;
    case 'generationsCount':
      return usage.generationsCount >= plan.limits.generationsPerMonth;
    case 'savedProductsCount':
      return usage.savedProductsCount >= plan.limits.savedProductsLimit;
    case 'historyCount':
      return usage.historyCount >= plan.limits.historyLimit;
    default:
      return false;
  }
});
