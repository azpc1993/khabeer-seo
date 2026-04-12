'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Loader2, AlertCircle, CheckCircle2, XCircle, TrendingUp, BarChart3, FileText, Link as LinkIcon, Copy } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNotificationsStore } from '@/store/notificationsStore';

const KeywordSchema = z.object({
  word: z.string(),
  count: z.number(),
});

const AnalysisResultSchema = z.object({
  score: z.number(),
  wordCount: z.number(),
  imagesCount: z.number(),
  imagesWithoutAlt: z.number(),
  hasH1: z.boolean(),
  h2Count: z.number(),
  hasMetaDescription: z.boolean(),
  topKeywords: z.array(KeywordSchema).optional(),
});

type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export default function KeywordGapClient() {
  const [myUrl, setMyUrl] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotificationsStore();
  
  const [myResult, setMyResult] = useState<AnalysisResult | null>(null);
  const [competitorResult, setCompetitorResult] = useState<AnalysisResult | null>(null);

  const [missingWords, setMissingWords] = useState<{word: string, compCount: number}[]>([]);
  const [sharedWords, setSharedWords] = useState<{word: string, myCount: number, compCount: number}[]>([]);
  const [myUniqueWords, setMyUniqueWords] = useState<{word: string, myCount: number}[]>([]);

  const handleAnalyze = async () => {
    if (!myUrl.trim() || !competitorUrl.trim()) {
      setError('يرجى إدخال رابط صفحتك ورابط المنافس');
      return;
    }
    setLoading(true);
    setError('');
    setMyResult(null);
    setCompetitorResult(null);

    try {
      const [myRes, compRes] = await Promise.all([
        fetch('/api/analyze-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: myUrl })
        }),
        fetch('/api/analyze-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: competitorUrl })
        })
      ]);

      if (!myRes.ok) {
        const errorData = await myRes.json().catch(() => null);
        throw new Error(errorData?.error || 'فشل تحليل رابط موقعك');
      }
      if (!compRes.ok) {
        const errorData = await compRes.json().catch(() => null);
        throw new Error(errorData?.error || 'فشل تحليل رابط المنافس');
      }

      const myData = await myRes.json();
      const compData = await compRes.json();

      const validatedMyData = AnalysisResultSchema.parse(myData);
      const validatedCompData = AnalysisResultSchema.parse(compData);

      setMyResult(validatedMyData);
      setCompetitorResult(validatedCompData);

      // Compare Keywords
      const myKws = validatedMyData.topKeywords || [];
      const compKws = validatedCompData.topKeywords || [];

      const myKwMap = new Map(myKws.map(k => [k.word, k.count]));
      const compKwMap = new Map(compKws.map(k => [k.word, k.count]));

      const missing: {word: string, compCount: number}[] = [];
      const shared: {word: string, myCount: number, compCount: number}[] = [];
      const unique: {word: string, myCount: number}[] = [];

      compKws.forEach(k => {
        if (myKwMap.has(k.word)) {
          shared.push({ word: k.word, myCount: myKwMap.get(k.word)!, compCount: k.count });
        } else {
          missing.push({ word: k.word, compCount: k.count });
        }
      });

      myKws.forEach(k => {
        if (!compKwMap.has(k.word)) {
          unique.push({ word: k.word, myCount: k.count });
        }
      });

      setMissingWords(missing.sort((a, b) => b.compCount - a.compCount));
      setSharedWords(shared.sort((a, b) => b.compCount - a.compCount));
      setMyUniqueWords(unique.sort((a, b) => b.myCount - a.myCount));

      addNotification({
        type: 'analysis',
        title: 'اكتمل تحليل الفجوة',
        message: 'تم مقارنة الكلمات المفتاحية بنجاح.',
        icon: Search,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      });
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ إلى الحافظة');
  };

  const generateRecommendations = () => {
    if (!myResult || !competitorResult) return [];
    const recs = [];

    if (missingWords.length > 0) {
      recs.push(`أضف الكلمات المفتاحية المفقودة مثل "${missingWords[0]?.word}" و "${missingWords[1]?.word || ''}" لزيادة فرص ظهورك.`);
    }
    
    if (myResult.wordCount < competitorResult.wordCount) {
      recs.push(`محتوى المنافس أطول (${competitorResult.wordCount} كلمة مقابل ${myResult.wordCount} كلمة). حاول زيادة طول وتفاصيل محتواك.`);
    }

    if (!myResult.hasH1 && competitorResult.hasH1) {
      recs.push(`المنافس يستخدم عنوان H1 بينما صفحتك تفتقر إليه. أضف عنوان H1 يتضمن كلمتك المفتاحية الرئيسية.`);
    }

    if (myResult.imagesWithoutAlt > 0) {
      recs.push(`لديك ${myResult.imagesWithoutAlt} صور بدون نص بديل (Alt Text). أضف نصوصاً بديلة لتحسين السيو للصور.`);
    }

    const underusedShared = sharedWords.filter(w => w.compCount > w.myCount * 2);
    if (underusedShared.length > 0) {
      recs.push(`المنافس يركز بشكل أكبر على كلمات مثل "${underusedShared[0].word}". حاول زيادة كثافتها بشكل طبيعي في محتواك.`);
    }

    if (recs.length === 0) {
      recs.push("أداؤك ممتاز ومقارب جداً للمنافس! استمر في تحديث المحتوى بانتظام.");
    }

    return recs.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-4 md:p-8" dir="rtl">
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
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">تحليل فجوة الكلمات المفتاحية</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">قارن محتواك مع المنافسين واكتشف الفرص الضائعة</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="url" 
                    value={myUrl}
                    onChange={(e) => setMyUrl(e.target.value)}
                    placeholder="رابط صفحتك (مثال: https://mysite.com/page)"
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all text-right font-bold text-slate-800 dark:text-white"
                    dir="ltr"
                  />
                </div>
                <div className="relative group">
                  <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="url" 
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="رابط المنافس (مثال: https://competitor.com/page)"
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-right font-bold text-slate-800 dark:text-white"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-end md:w-48">
              <button 
                onClick={handleAnalyze}
                disabled={loading || !myUrl || !competitorUrl}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-5 rounded-[1.5rem] font-black shadow-xl shadow-purple-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>ابدأ تحليل الفجوة</span>
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
        {myResult && competitorResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* Section A: Quick Summary */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <BarChart3 className="w-7 h-7 text-purple-500" />
                ملخص سريع
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-500 mb-2">الكلمات المشتركة</p>
                  <p className="text-3xl font-black text-indigo-600">{sharedWords.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-500 mb-2">الكلمات المفقودة</p>
                  <p className="text-3xl font-black text-rose-500">{missingWords.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-500 mb-2">كلماتك الخاصة</p>
                  <p className="text-3xl font-black text-emerald-500">{myUniqueWords.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-6 shadow-sm text-white">
                  <p className="text-sm font-bold text-purple-200 mb-2">أهم فرصة</p>
                  <p className="text-2xl font-black">{missingWords[0]?.word || 'لا يوجد'}</p>
                  {missingWords[0] && <p className="text-xs text-purple-200 mt-1">مكررة {missingWords[0].compCount} مرات عند المنافس</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Section B: Missing Words */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-rose-100 dark:border-rose-900/30">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-rose-600">
                  <XCircle className="w-6 h-6" />
                  الكلمات المفقودة
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">كلمات موجودة عند المنافس وغير موجودة لديك.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {missingWords.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.word}</p>
                        <p className="text-xs text-slate-500">تكرار المنافس: {item.compCount}</p>
                      </div>
                      <button onClick={() => copyToClipboard(item.word)} className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 rounded-lg transition-colors" title="نسخ الكلمة">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {missingWords.length === 0 && <p className="text-slate-500 text-sm text-center py-4">لا توجد كلمات مفقودة!</p>}
                </div>
              </div>

              {/* Section C: Shared Words */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-indigo-600">
                  <CheckCircle2 className="w-6 h-6" />
                  الكلمات المشتركة
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">مقارنة تكرار الكلمات بينك وبين المنافس.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {sharedWords.map((item, idx) => {
                    const isUnderused = item.compCount > item.myCount;
                    return (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{item.word}</p>
                          <div className="flex gap-3 text-xs mt-1">
                            <span className="text-indigo-600 font-bold">أنت: {item.myCount}</span>
                            <span className="text-purple-600 font-bold">المنافس: {item.compCount}</span>
                          </div>
                        </div>
                        {isUnderused && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-2 py-1 rounded-md">زد الكثافة</span>
                        )}
                      </div>
                    );
                  })}
                  {sharedWords.length === 0 && <p className="text-slate-500 text-sm text-center py-4">لا توجد كلمات مشتركة.</p>}
                </div>
              </div>

              {/* Section D: My Unique Words */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                  كلماتك الخاصة
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">كلمات تميزك عن المنافس.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {myUniqueWords.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.word}</p>
                        <p className="text-xs text-slate-500">التكرار لديك: {item.myCount}</p>
                      </div>
                    </div>
                  ))}
                  {myUniqueWords.length === 0 && <p className="text-slate-500 text-sm text-center py-4">لا توجد كلمات خاصة بك.</p>}
                </div>
              </div>
            </div>

            {/* Section E: General Comparison */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-6 h-6 text-purple-500" />
                مقارنة عامة
              </h3>
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="py-4 px-4 font-bold text-slate-500">المعيار</th>
                    <th className="py-4 px-4 font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-900/10 rounded-tr-xl">موقعك</th>
                    <th className="py-4 px-4 font-bold text-slate-900 dark:text-white bg-purple-50 dark:bg-purple-900/10 rounded-tl-xl">المنافس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عدد الكلمات</td>
                    <td className="py-4 px-4 font-bold text-indigo-600">{myResult.wordCount}</td>
                    <td className="py-4 px-4 font-bold text-purple-600">{competitorResult.wordCount}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عنوان H1</td>
                    <td className="py-4 px-4">{myResult.hasH1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}</td>
                    <td className="py-4 px-4">{competitorResult.hasH1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عناوين H2</td>
                    <td className="py-4 px-4">{myResult.h2Count}</td>
                    <td className="py-4 px-4">{competitorResult.h2Count}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">عدد الصور</td>
                    <td className="py-4 px-4">{myResult.imagesCount}</td>
                    <td className="py-4 px-4">{competitorResult.imagesCount}</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">صور بدون Alt</td>
                    <td className="py-4 px-4 text-rose-500">{myResult.imagesWithoutAlt}</td>
                    <td className="py-4 px-4 text-rose-500">{competitorResult.imagesWithoutAlt}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section F: How to beat them */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 shadow-xl shadow-purple-200/50 dark:shadow-none text-white">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                <TrendingUp className="w-7 h-7" />
                كيف تتفوق عليه
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generateRecommendations().map((rec, idx) => (
                  <div key={idx} className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10 flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-black">
                      {idx + 1}
                    </div>
                    <p className="font-bold leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Empty State */}
        {!myResult && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm mt-8">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400 dark:text-purple-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">ابدأ تحليل فجوة الكلمات</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              أدخل رابط صفحتك ورابط صفحة المنافس لاكتشاف الكلمات المفتاحية التي يركز عليها المنافس وتفتقدها أنت، واحصل على توصيات مباشرة للتفوق عليه.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
