// hooks/useFeatureAccess.ts
'use client';

import { useAtomValue } from 'jotai';
import { isFeatureLockedAtom, currentPlanAtom, usageAtom } from '@/store/subscriptionStore';

export const useFeatureAccess = () => {
  const isLockedFn = useAtomValue(isFeatureLockedAtom);
  const plan = useAtomValue(currentPlanAtom);
  const usage = useAtomValue(usageAtom);

  const checkAccess = (featureKey: string) => {
    return !isLockedFn(featureKey);
  };

  return {
    checkAccess,
    plan,
    usage,
    isLocked: isLockedFn
  };
};
