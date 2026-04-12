// hooks/useSubscription.ts
'use client';

import { useAtom } from 'jotai';
import { subscriptionAtom, usageAtom, currentPlanAtom, isFeatureLockedAtom } from '@/store/subscriptionStore';
import { subscriptionService } from '@/services/subscriptionService';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useSubscription = () => {
  const [subscription, setSubscription] = useAtom(subscriptionAtom);
  const [usage, setUsage] = useAtom(usageAtom);
  const plan = useAtom(currentPlanAtom);
  const isLockedFn = useAtom(isFeatureLockedAtom);

  const refreshData = useCallback(async (userId: string) => {
    try {
      const [subData, usageData] = await Promise.all([
        subscriptionService.getUserSubscription(userId),
        subscriptionService.getUserUsage(userId)
      ]);

      if (subData) setSubscription(subData);
      if (usageData) setUsage(usageData);
    } catch (error) {
      console.error('Failed to refresh subscription data:', error);
    }
  }, [setSubscription, setUsage]);

  useEffect(() => {
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChanged((event, session) => {
      if (session?.user) {
        refreshData(session.user.id);
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  }, [refreshData]);

  const startTrial = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (subscription.trialUsed) {
      alert('لقد استخدمت الفترة التجريبية مسبقاً.');
      return;
    }

    try {
      await subscriptionService.updateSubscription(user.id, 'pro');
      // تحديث الحالة محلياً أيضاً
      setSubscription(prev => ({
        ...prev,
        planId: 'pro',
        status: 'trialing',
        currentPeriodEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        trialUsed: true
      }));
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  return {
    subscription,
    usage,
    plan,
    isLocked: isLockedFn,
    startTrial,
    refreshData
  };
};
