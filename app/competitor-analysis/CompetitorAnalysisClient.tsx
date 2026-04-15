'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, XCircle, TrendingUp, BarChart3, FileText, Image as ImageIcon, Type, Link as LinkIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useNotificationsStore } from '@/store/notificationsStore';
import { decodeUnicode } from '@/utils/unicode';
import { normalizeArabicSeoTerms } from '@/utils/arabicNormalizer';

const AnalysisResultSchema = z.object({
  score: z.number(),
  wordCount: z.number(),
  imagesCount: z.number(),
  imagesWithoutAlt: z.number(),
  hasH1: z.boolean(),
  h2Count: z.number(),
  hasMetaDescription: z.boolean(),
  keywords: z.object({
    primary: z.array(z.string()),
    lsi: z.array(z.string()),
    missing: z.array(z.string()),
  }),
  recommendations: z.array(z.any()),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export default function CompetitorAnalysisClient() {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [userUrl, setUserUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [competitorResult, setCompetitorResult] = useState<AnalysisResult | null>(null);
  const [userResult, setUserResult] = useState<AnalysisResult | null>(null);
  const { addNotification } = useNotificationsStore();

  const handleAnalyze = async () => {
    if (!competitorUrl.trim()) {
      setError('يرجى إدخال رابط المنافس');
      return;
    }
    setLoading(true);
    setError('');
    setCompetitorResult(null);
    setUserResult(null);

    try {
      const compRes = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: competitorUrl })
      });

      if (!compRes.ok) {
        const errorData = await compRes.json().catch(() => null);
        throw new Error(errorData?.error || 'فشل تحليل رابط المنافس');
      }
      const compData = await compRes.json();
      
      const safeText = (text: string) => normalizeArabicSeoTerms(decodeUnicode(text || ''));
      
      if (compData.keywords) {
        if (compData.keywords.primary) compData.keywords.primary = compData.keywords.primary.map(safeText);
        if (compData.keywords.lsi) compData.keywords.lsi = compData.keywords.lsi.map(safeText);
        if (compData.keywords.missing) compData.keywords.missing = compData.keywords.missing.map(safeText);
      }
      
      try {
        const validatedCompData = AnalysisResultSchema.parse(compData);
        setCompetitorResult(validatedCompData);
      } catch (validationError) {
        console.error('Validation error (Competitor):', validationError);
        throw new Error('بيانات تحليل المنافس غير صالحة');
      }

      if (userUrl.trim()) {
        const userRes = await fetch('/api/analyze-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: userUrl })
        });
        if (!userRes.ok) {
          const errorData = await userRes.json().catch(() => null);
          throw new Error(errorData?.error || 'فشل تحليل رابط موقعك');
        }
        const userData = await userRes.json();
        
        if (userData.keywords) {
          if (userData.keywords.primary) userData.keywords.primary = userData.keywords.primary.map(safeText);
          if (userData.keywords.lsi) userData.keywords.lsi = userData.keywords.lsi.map(safeText);
          if (userData.keywords.missing) userData.keywords.missing = userData.keywords.missing.map(safeText);
        }
        
        try {
          const validatedUserData = AnalysisResultSchema.parse(userData);
          setUserResult(validatedUserData);
        } catch (validationError) {
          console.error('Validation error (User):', validationError);
          throw new Error('بيانات تحليل موقعك غير صالحة');
        }
      }
      
      addNotification({
        type: 'analysis',
        title: 'اكتمل التحليل',
        message: 'تم تحليل المنافس بنجاح.',
        icon: BarChart3,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  };

  const renderComparisonTable = () => {
    if (!competitorResult || !userResult) return null;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          مقارنة الأداء
        </h3>
        <table className="w-full text-right border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="py-4 px-4 font-bold text-slate-500">المعيار</th>
              <th className="py-4 px-4 font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50 rounded-tr-xl">موقعك</th>
              <th className="py-4 px-4 font-bold text-slate-900 dark:text-white bg-purple-50 dark:bg-purple-900/10 rounded-tl-xl">المنافس</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">نقاط السيو</td>
              <td className="py-4 px-4 font-bold text-indigo-600">{userResult.score}/100</td>
              <td className="py-4 px-4 font-bold text-purple-600">{competitorResult.score}/100</td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عدد الكلمات</td>
              <td className="py-4 px-4">{userResult.wordCount}</td>
              <td className="py-4 px-4">{competitorResult.wordCount}</td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عدد الصور</td>
              <td className="py-4 px-4">{userResult.imagesCount}</td>
              <td className="py-4 px-4">{competitorResult.imagesCount}</td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">صور بدون Alt</td>
              <td className="py-4 px-4 text-rose-500">{userResult.imagesWithoutAlt}</td>
              <td className="py-4 px-4 text-rose-500">{competitorResult.imagesWithoutAlt}</td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عنوان H1</td>
              <td className="py-4 px-4">{userResult.hasH1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}</td>
              <td className="py-4 px-4">{competitorResult.hasH1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}</td>
            </tr>
            <tr>
              <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عناوين H2</td>
              <td className="py-4 px-4">{userResult.h2Count || 0}</td>
              <td className="py-4 px-4">{competitorResult.h2Count || 0}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors mb-8 font-black text-sm uppercase tracking-widest">
          <ArrowRight className="w-5 h-5" />
          العودة للرئيسية
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">تحليل المنافسين</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">اكتشف استراتيجيات منافسيك وتفوق عليهم</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="url" 
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="رابط المنافس (مثال: https://competitor.com/product)"
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-right font-bold text-slate-800 dark:text-white"
                    dir="ltr"
                  />
                </div>
                <div className="relative group">
                  <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="url" 
                    value={userUrl}
                    onChange={(e) => setUserUrl(e.target.value)}
                    placeholder="رابط موقعك (اختياري للمقارنة)"
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-right font-bold text-slate-800 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end md:w-48">
              <button 
                onClick={handleAnalyze}
                disabled={loading || !competitorUrl}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl shadow-purple-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>تحليل المنافس</span>
                    <TrendingUp className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-rose-500 text-sm mt-6 font-black bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </div>

        {/* Results */}
        {competitorResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Section 1: Overview */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <BarChart3 className="w-7 h-7 text-blue-500" />
                نظرة عامة على المنافس (Competitor Overview)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">عدد الكلمات (Word Count)</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{competitorResult.wordCount}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">الصور (Images Count)</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{competitorResult.imagesCount} <span className="text-sm text-rose-500">({competitorResult.imagesWithoutAlt} بدون Alt)</span></p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
                    <Type className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">العناوين (hasH1)</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{competitorResult.hasH1 ? 'نعم (Yes)' : 'لا (No)'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Content Analysis */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Search className="w-7 h-7 text-indigo-500" />
                تحليل المحتوى (Content Analysis)
              </h3>
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-3">الكلمات المفتاحية الأكثر تكراراً:</p>
                    <div className="flex flex-wrap gap-2">
                      {competitorResult.topKeywords?.slice(0, 10).map((kw, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                          <span>{kw.word}</span>
                          <span className="bg-indigo-100 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-lg">{kw.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-3">كلمات مقترحة (LSI):</p>
                    <div className="flex flex-wrap gap-2">
                      {competitorResult.keywords?.lsi?.map((kw, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            {userResult && renderComparisonTable()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Section 4: Strengths */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                    نقاط القوة
                  </h3>
                  <ul className="space-y-3">
                    {competitorResult.hasH1 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        يستخدم عنوان H1 بشكل صحيح
                      </li>
                    )}
                    {competitorResult.hasMetaDescription && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        يحتوي على وصف ميتا (Meta Description)
                      </li>
                    )}
                    {competitorResult.wordCount > 300 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        محتوى طويل نسبياً ({competitorResult.wordCount} كلمة)
                      </li>
                    )}
                    {competitorResult.imagesCount > 0 && competitorResult.imagesWithoutAlt === 0 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        جميع الصور تحتوي على نصوص بديلة (Alt Text)
                      </li>
                    )}
                    {(!competitorResult.hasH1 && !competitorResult.hasMetaDescription && competitorResult.wordCount <= 300) && (
                      <li className="text-slate-500 italic">لا توجد نقاط قوة بارزة في السيو الأساسي.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                {/* Section 5: Weaknesses */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-rose-100 dark:border-rose-900/30">
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-rose-600">
                    <XCircle className="w-6 h-6" />
                    نقاط الضعف
                  </h3>
                  <ul className="space-y-3">
                    {!competitorResult.hasH1 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        يفتقر لعنوان H1 الرئيسي
                      </li>
                    )}
                    {!competitorResult.hasMetaDescription && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        لا يوجد وصف ميتا (Meta Description)
                      </li>
                    )}
                    {competitorResult.wordCount <= 300 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        محتوى قصير جداً (أقل من 300 كلمة)
                      </li>
                    )}
                    {competitorResult.imagesWithoutAlt > 0 && (
                      <li className="flex items-start gap-2 text-slate-700 dark:text-slate-300 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        يوجد {competitorResult.imagesWithoutAlt} صور بدون نصوص بديلة (Alt Text)
                      </li>
                    )}
                    {(competitorResult.hasH1 && competitorResult.hasMetaDescription && competitorResult.wordCount > 300 && competitorResult.imagesWithoutAlt === 0) && (
                      <li className="text-slate-500 italic">لا توجد نقاط ضعف بارزة في السيو الأساسي.</li>
                    )}
                  </ul>
                </div>

                {/* Section 6: How to beat them */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-xl shadow-purple-200/50 dark:shadow-none text-white">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    كيف تتفوق عليه
                  </h3>
                  <div className="space-y-4">
                    {competitorResult.wordCount < 500 ? (
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="font-bold mb-1">1. زيادة طول المحتوى</p>
                        <p className="text-purple-100 text-sm">المنافس يمتلك محتوى قصير. اكتب وصفاً يتجاوز 500 كلمة لتغطية تفاصيل أكثر.</p>
                      </div>
                    ) : (
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="font-bold mb-1">1. تحسين جودة المحتوى</p>
                        <p className="text-purple-100 text-sm">المنافس لديه محتوى طويل. ركز على إضافة قيمة حقيقية وتنسيق أفضل (قوائم، جداول).</p>
                      </div>
                    )}
                    
                    {competitorResult.imagesWithoutAlt > 0 ? (
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="font-bold mb-1">2. استغلال بحث الصور</p>
                        <p className="text-purple-100 text-sm">المنافس يهمل نصوص Alt. أضف صوراً عالية الجودة مع نصوص بديلة غنية بالكلمات المفتاحية.</p>
                      </div>
                    ) : (
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="font-bold mb-1">2. استخدام وسائط متعددة</p>
                        <p className="text-purple-100 text-sm">أضف فيديو توضيحي للمنتج لزيادة وقت بقاء الزائر وتجاوز المنافس.</p>
                      </div>
                    )}

                    {(!competitorResult.hasH1 || !competitorResult.hasMetaDescription) && (
                      <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                        <p className="font-bold mb-1">3. تحسين السيو التقني</p>
                        <p className="text-purple-100 text-sm">المنافس لديه أخطاء سيو أساسية. تأكد من استخدام H1 ووصف ميتا جذاب لزيادة نسبة النقر.</p>
                      </div>
                    )}
                    
                    <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                      <p className="font-bold mb-1">4. استهداف الكلمات المفقودة</p>
                      <p className="text-purple-100 text-sm">استخدم الكلمات المفتاحية التي يركز عليها المنافس، وأضف كلمات LSI إضافية لتغطية أشمل.</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/20">
                      <Link href={{ pathname: '/', query: { tab: 'generate', competitor: competitorResult.topKeywords?.slice(0, 10).map((k: { keyword: string }) => k.keyword).join('، ') } }} passHref>
                        <button className="w-full bg-white text-purple-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          توليد محتوى يتفوق على المنافس
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!competitorResult && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm mt-8">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400 dark:text-purple-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">لا توجد نتائج حتى الآن</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              للبدء، قم بإدخال رابط صفحة المنافس في حقل البحث بالأعلى واضغط على زر &quot;تحليل المنافس&quot;. سنقوم باستخراج الكلمات المفتاحية، وتحليل المحتوى، وتقديم توصيات للتفوق عليه.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> تحليل الكلمات</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> فحص الصور</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> نقاط القوة والضعف</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
