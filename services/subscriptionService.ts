// services/subscriptionService.ts
import { supabase } from '@/lib/supabase';
import { UserSubscription, UserUsage, PlanId } from '@/types/subscription';

export const subscriptionService = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription (Supabase/RLS issue):', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in getUserSubscription:', err);
      return null;
    }
  },

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching usage (Supabase/RLS issue):', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in getUserUsage:', err);
      return null;
    }
  },

  async incrementUsage(userId: string, feature: keyof UserUsage) {
    if (!userId) {
      console.warn('incrementUsage called without userId');
      return null;
    }
    try {
      const { data, error } = await supabase.rpc('increment_usage', {
        user_id_input: userId,
        feature_column: feature
      });

      if (error) {
        console.error('Error incrementing usage (Missing RPC or Supabase issue):', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in incrementUsage:', err);
      return null;
    }
  },

  async startTrial(userId: string, planId: PlanId) {
    if (!userId) {
      console.warn('startTrial called without userId');
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'trialing',
          current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trial_used: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error starting trial (Missing table or RLS issue):', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in startTrial:', err);
      return null;
    }
  },

  async updateSubscription(userId: string, planId: PlanId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating subscription:', error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception in updateSubscription:', err);
      return null;
    }
  }
};
