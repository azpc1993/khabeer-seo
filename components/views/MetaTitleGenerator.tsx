'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Copy, AlertCircle, LayoutGrid } from 'lucide-react';
import { callGeminiAPI } from '@/lib/api';
import { toast } from 'sonner';
import { copyRichTextToClipboard } from '@/lib/clipboard';

interface MetaTitleGeneratorProps {
  setActiveTool: (tool: string | null) => void;
}

export const MetaTitleGenerator: React.FC<MetaTitleGeneratorProps> = ({ setActiveTool }) => {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('يرجى إدخال موضوع أو اسم المنتج');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const prompt = `أنت خبير سيو (SEO) متخصص في كتابة العناوين الوصفية (Meta Titles).
قم بتوليد 5 عناوين وصفية جذابة ومحسنة لمحركات البحث للموضوع التالي: "${topic}".
${keywords ? `الكلمات المفتاحية المستهدفة: "${keywords}".` : ''}

شروط العناوين:
1. يجب أن يكون طول العنوان بين 50 إلى 60 حرفاً.
2. يجب أن يتضمن الكلمة المفتاحية الرئيسية.
3. يجب أن يكون جذاباً ويزيد من نسبة النقر إلى الظهور (CTR).
4. قدم العناوين فقط كقائمة مرقمة بدون أي مقدمات أو شروحات إضافية.`;

      const response = await callGeminiAPI(prompt, 'gemini-2.5-flash');
      
      const titles = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      if (titles.length > 0) {
        setResults(titles);
      } else {
        setError('لم يتم توليد عناوين صالحة، يرجى المحاولة مرة أخرى.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء توليد العناوين.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    copyRichTextToClipboard(text);
    toast.success('تم نسخ العنوان بنجاح');
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-[#F8FAFC] min-h-full">
      <button 
        onClick={() => setActiveTool(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors mb-6 font-black text-sm uppercase tracking-widest"
      >
        <ArrowLeft className="w-5 h-5" />
        العودة للأدوات
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="flex items-center gap-6 mb-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-100 dark:shadow-none">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">توليد العناوين الوصفية</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">احصل على عناوين Meta Titles جذابة ومتوافقة مع السيو</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">الموضوع أو اسم المنتج <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: حذاء رياضي نايك اير ماكس"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2">الكلمات المفتاحية (اختياري)</label>
            <input 
              type="text" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="مثال: حذاء رياضي، نايك، مريح، للجري"
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-cyan-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <span>توليد العناوين</span>
                <LayoutGrid className="w-5 h-5" />
              </>
            )}
          </button>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-rose-500 text-sm font-black bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">النتائج:</h3>
          {results.map((title, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between gap-4 group">
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-200 font-bold leading-relaxed">{title}</p>
                <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-500">
                  <span className={title.length >= 50 && title.length <= 60 ? 'text-emerald-500' : 'text-amber-500'}>
                    الطول: {title.length} حرف
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleCopy(title)}
                className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-colors"
                title="نسخ"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
