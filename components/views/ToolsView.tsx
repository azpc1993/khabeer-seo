'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Common';
import { Search, LayoutList, Image as ImageIcon, Users, ArrowLeft, ArrowRight, Loader2, BarChart3, AlertCircle, Lightbulb, Globe, LayoutGrid, Zap } from 'lucide-react';
import Link from 'next/link';
import { analyzeUrlSEO, SeoMetrics } from '@/services/seoAnalyzer';
import SeoVisualizer from '@/components/SeoVisualizer';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { useAtom } from 'jotai';
import { usageAtom } from '@/store/subscriptionStore';
import { subscriptionService } from '@/services/subscriptionService';
import { supabase } from '@/lib/supabase';

interface ToolsViewProps {
  goToTab: (tab: string) => void;
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
}

const ToolsView: React.FC<ToolsViewProps> = ({ goToTab, activeTool, setActiveTool }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoMetrics | null>(null);
  const [error, setError] = useState('');
  const [, setUsage] = useAtom(usageAtom);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = sessionStorage.getItem('seoCheckUrl');
      if (savedUrl) setUrl(savedUrl);
      
      const savedResult = sessionStorage.getItem('seoCheckResult');
      if (savedResult) {
        try {
          setResult(JSON.parse(savedResult));
        } catch (e) {
          console.error('Failed to parse saved SEO result', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (url) {
      sessionStorage.setItem('seoCheckUrl', url);
    }
  }, [url]);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem('seoCheckResult', JSON.stringify(result));
    } else {
      sessionStorage.removeItem('seoCheckResult');
    }
  }, [result]);

  const handleCheck = async () => {
    if (!url.trim()) {
      setError('يرجى إدخال رابط صحيح');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeUrlSEO(url);
      setResult(data);

      // Increment SaaS usage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await subscriptionService.incrementUsage(user.id, 'analyses');
          setUsage(prev => ({ ...prev, analyses: prev.analyses + 1 }));
        } catch (e) {
          console.error('Failed to increment SaaS usage', e);
        }
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء فحص الرابط.');
    } finally {
      setLoading(false);
    }
  };

  if (activeTool === 'seo-check') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#F8FAFC] min-h-full">
        <button 
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-6 font-black text-sm uppercase tracking-widest"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للأدوات
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-100 dark:shadow-none">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">مدقق السيو المباشر</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">حلل جودة السيو واكتشف فرص التحسين الفورية</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 relative z-10">
            <div className="flex-1 relative group">
              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="url" 
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (result) setResult(null);
                }}
                placeholder="https://example.com/product"
                className="w-full pr-6 pl-14 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-left dir-ltr font-bold text-slate-800 dark:text-white"
                dir="ltr"
              />
            </div>
            <button 
              onClick={handleCheck}
              disabled={loading || !url}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-xl shadow-purple-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[180px]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>تحليل الرابط</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-rose-500 text-sm mt-4 font-black bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-900/30 w-fit">
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>

        {result && (
          <SeoVisualizer 
            data={result} 
            onActionClick={() => {
              // توجيه لصفحة التوليد
              goToTab('product');
            }} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-[#F8FAFC] dark:bg-slate-950 min-h-full">
      {/* CTA Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-purple-200/50 dark:shadow-none relative overflow-hidden flex flex-col items-center justify-center text-center mb-12"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20 shadow-inner">
            <Icon icon={LayoutGrid} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">مركز الأدوات الذكية</h1>
          <p className="text-purple-100 text-lg md:text-xl font-bold leading-relaxed opacity-90">مجموعتك المتكاملة من الأدوات المتقدمة لتحليل وتحسين أداء منتجاتك وتصدر نتائج البحث.</p>
        </div>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* Live SEO Checker */}
        <motion.div
          whileHover={{ y: -5 }}
          className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 dark:hover:border-purple-800"
          onClick={() => setActiveTool('seo-check')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner shrink-0">
            <Icon icon={Search} className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">مدقق السيو المباشر</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">تحليل فوري لروابط منتجاتك مع توصيات ذكية للتحسين.</p>
          <div className="mt-4 md:mt-6 flex items-center gap-2 text-purple-600 font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:-translate-x-1 transition-transform">
            <span>ابدأ الفحص</span>
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </motion.div>

        {/* Content Library */}
        <motion.div
          whileHover={{ y: -5 }}
          className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-800"
          onClick={() => goToTab('product')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 text-indigo-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner shrink-0">
            <Icon icon={LayoutList} className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">مكتبة المحتوى</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">إدارة وتنظيم محتواك المولد بسهولة في مكان واحد.</p>
          <div className="mt-4 md:mt-6 flex items-center gap-2 text-indigo-600 font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:-translate-x-1 transition-transform">
            <span>تصفح المكتبة</span>
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
          </div>
        </motion.div>

        {/* Competitor Analysis */}
        <FeatureGuard 
          featureKey="competitorAnalysis" 
          featureName="تحليل المنافسين"
          onUpgradeClick={() => goToTab('pricing')}
        >
          <Link href="/competitor-analysis" passHref>
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 text-rose-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner shrink-0">
                <Icon icon={Users} className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">تحليل المنافسين</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">راقب استراتيجيات منافسيك وتصدر نتائج البحث.</p>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-rose-600 font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:-translate-x-1 transition-transform">
                <span>ابدأ التحليل</span>
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </motion.div>
          </Link>
        </FeatureGuard>

        {/* Keyword Gap Tool */}
        <FeatureGuard 
          featureKey="keywordInsights" 
          featureName="تحليل فجوة الكلمات"
          onUpgradeClick={() => goToTab('pricing')}
        >
          <Link href="/keyword-gap" passHref>
            <motion.div
              whileHover={{ y: -5 }}
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 text-emerald-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner shrink-0">
                <Icon icon={BarChart3} className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">تحليل فجوة الكلمات</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">اكتشف الكلمات المفتاحية المفقودة وتفوق على منافسيك.</p>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-emerald-600 font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:-translate-x-1 transition-transform">
                <span>ابدأ التحليل</span>
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </motion.div>
          </Link>
        </FeatureGuard>

        {/* Auto SEO Engine */}
        <FeatureGuard 
          featureKey="autoSeo" 
          featureName="Auto SEO Engine"
          onUpgradeClick={() => goToTab('pricing')}
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-all flex flex-col h-full cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200 dark:hover:border-amber-800"
            onClick={() => goToTab('auto-seo')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-600 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-inner shrink-0">
              <Icon icon={Zap} className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">Auto SEO Engine</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">نظام التحسين التلقائي للمحتوى وتصدر نتائج البحث بدون تدخل يدوي.</p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-amber-600 font-black text-[10px] md:text-xs uppercase tracking-widest group-hover:-translate-x-1 transition-transform">
              <span>تفعيل المحرك</span>
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </motion.div>
        </FeatureGuard>

        {/* Upcoming Tools */}
        {[
          { icon: ImageIcon, title: 'تحسين الصور', desc: 'ضغط ذكي للصور لتسريع متجرك وتعزيز السيو.', hoverClass: 'group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20' },
          { icon: Lightbulb, title: 'اقتراحات ذكية', desc: 'أفكار محتوى مبتكرة مبنية على أحدث اتجاهات السوق.', hoverClass: 'group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20' }
        ].map((tool, i) => (
          <div key={i} className="group relative bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl p-5 md:p-8 border border-slate-100/50 dark:border-slate-800/50 flex flex-col h-full overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none hover:border-slate-200 dark:hover:border-slate-700">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-800/50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4 md:mb-6 shadow-inner shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${tool.hoverClass}`}>
              <Icon icon={tool.icon} className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2 md:mb-3 tracking-tight">{tool.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs md:text-sm flex-grow">{tool.desc}</p>
            <div className="mt-4 md:mt-6 flex items-center justify-between">
              <span className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">قريباً</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolsView;
