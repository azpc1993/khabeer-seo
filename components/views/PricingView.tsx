// components/views/PricingView.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { useAtom } from 'jotai';
import { subscriptionAtom } from '@/store/subscriptionStore';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface PricingViewProps {
  onBack: () => void;
  user: User | null;
}

const PricingView: React.FC<PricingViewProps> = ({ onBack, user }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription] = useAtom(subscriptionAtom);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      onBack();
      return;
    }

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    // بما أن التجربة الآن تلقائية، نقوم بالتحويل مباشرة للدفع إذا أراد المستخدم الترقية أو الاشتراك الفعلي
    setLoadingPlan(planId);
    try {
      await stripeService.createCheckoutSession(planId, billingCycle);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Checkout error:', message);
      toast.error('فشل بدء عملية الدفع: ' + message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-slate-950 min-h-full">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-10 font-black text-sm uppercase tracking-widest"
      >
        <ArrowRight className="w-5 h-5" />
        العودة للوحة التحكم
      </button>

      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-purple-100 shadow-sm"
        >
          <Zap size={14} className="fill-current" />
          <span>خطط الأسعار والاشتراكات</span>
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">اختر الخطة المناسبة لنموك</h1>
        
        <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-2xl border border-amber-100 dark:border-amber-800 mb-8">
          <Zap className="w-5 h-5 text-amber-600 animate-pulse" />
          <span className="text-amber-700 dark:text-amber-300 font-black text-sm">مرحباً بك! لقد حصلت تلقائياً على تجربة مجانية لمدة 7 أيام لكافة الميزات الاحترافية.</span>
        </div>

        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          سواء كنت تبدأ رحلتك أو تدير وكالة كبيرة، لدينا الخطة المثالية التي تضمن لك تصدر نتائج البحث وزيادة المبيعات.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <span className={`text-sm font-black transition-colors ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>شهري</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-16 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative p-1 transition-all"
          >
            <motion.div 
              animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
              className="w-6 h-6 bg-white dark:bg-slate-600 rounded-full shadow-md"
            />
          </button>
          <span className={`text-sm font-black transition-colors ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>سنوي (خصم 20%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border transition-all flex flex-col h-full ${
              plan.isRecommended 
                ? 'border-purple-500 shadow-2xl shadow-purple-500/10 scale-105 z-10' 
                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xl'
            }`}
          >
            {plan.isRecommended && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-200 dark:shadow-none flex items-center gap-2">
                <Star size={12} className="fill-current" />
                <span>الأكثر طلباً</span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{plan.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  ${billingCycle === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12)}
                </span>
                <span className="text-slate-400 font-bold text-sm">/ شهرياً</span>
              </div>
              {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                <p className="text-green-600 text-xs font-black mt-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit">
                  يتم دفع ${plan.price.yearly} سنوياً
                </p>
              )}
            </div>

            <div className="space-y-4 mb-10 flex-grow">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">الميزات والحدود:</p>
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-bold text-sm leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-purple-600" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loadingPlan !== null || subscription.planId === plan.id}
              className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
                subscription.planId === plan.id
                  ? 'bg-slate-100 text-slate-400 cursor-default shadow-none'
                  : plan.isRecommended
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-100 dark:shadow-none hover:scale-[1.02] active:scale-95'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-slate-100 dark:shadow-none hover:scale-[1.02] active:scale-95'
              }`}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : subscription.planId === plan.id ? (
                subscription.status === 'trialing' ? 'أنت في الفترة التجريبية' : 'خطتك الحالية'
              ) : (
                <>
                  <Zap size={18} className="fill-current" />
                  <span>{plan.price.monthly === 0 ? 'ابدأ الآن' : 'اشترك الآن'}</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Section (Simplified) */}
      <div className="mt-24 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">لماذا تختار باقاتنا؟</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">نحن نقدم أفضل قيمة مقابل السعر في السوق العربي.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'سرعة فائقة', desc: 'توليد محتوى وتحليل سيو في ثوانٍ معدودة.' },
            { icon: ShieldCheck, title: 'أمان تام', desc: 'بياناتك ونتائجك محفوظة بأعلى معايير الأمان.' },
            { icon: Star, title: 'دعم فني', desc: 'فريقنا متاح لمساعدتك في أي وقت لتطوير متجرك.' }
          ].map((item, i) => (
            <div key={i} className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                <item.icon size={24} />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingView;
