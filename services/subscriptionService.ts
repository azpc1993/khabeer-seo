// services/subscriptionService.ts
import { supabase } from '@/lib/supabase';
import { UserSubscription, UserUsage, PlanId } from '@/types/subscription';

export const subscriptionService = {
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  },

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching usage:', error);
      return null;
    }

    return data;
  },

  async incrementUsage(userId: string, feature: keyof UserUsage) {
    const { data, error } = await supabase.rpc('increment_usage', {
      user_id_input: userId,
      feature_column: feature
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }

    return data;
  },

  async startTrial(userId: string, planId: PlanId) {
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
      console.error('Error starting trial:', error);
      throw error;
    }

    return data;
  },

  async updateSubscription(userId: string, planId: PlanId) {
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
      console.error('Error updating subscription:', error);
      throw error;
    }

    return data;
  }
};
