import React, { useState } from 'react';
import { callGeminiAPI } from '@/lib/api';
import { SeoMetrics } from '@/services/seoAnalyzer';
import { Loader2, Copy, CheckCircle, BarChart, AlertTriangle, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';

interface ContentGapAnalyzerProps {
  data: SeoMetrics;
}

interface GapData {
  qualityScore: number;
  competitorAnalysis: {
    avgWordCount: number;
    commonHeadings: string[];
    commonKeywords: string[];
    hasFaq: boolean;
  };
  gaps: {
    missingSections: string[];
    missingKeywords: string[];
    contentDepth: string;
  };
  solutions: {
    suggestedHeadings: string[];
    suggestedParagraphs: { title: string; content: string }[];
    recommendedKeywords: string[];
  };
}

export const ContentGapAnalyzer: React.FC<ContentGapAnalyzerProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [gapData, setGapData] = useState<GapData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(id);
      toast.success('تم النسخ بنجاح');
      setTimeout(() => setCopied(null), 2000);
    } else {
      toast.error('فشل النسخ، يرجى المحاولة مرة أخرى');
    }
  };

  const analyzeGap = async () => {
    if (!data.extractedTexts) return;
    setLoading(true);
    try {
      const primaryKeyword = data.keywords.primary[0] || 'المنتج';
      const prompt = `أنت خبير سيو محترف ومحلل محتوى تنافسي. قم بتحليل الفجوة بين محتوى المستخدم الحالي ومحتوى المنافسين المتصدرين للكلمة المفتاحية: "${primaryKeyword}".

البيانات الحالية للمستخدم:
- عدد الكلمات: ${data.wordCount}
- العناوين: ${data.extractedTexts.h1} | ${data.extractedTexts.h2s.join(' | ')}
- الكلمات المفتاحية المستخدمة: ${data.keywords.primary.join(', ')}

المطلوب إرجاعه بصيغة JSON فقط:
{
  "qualityScore": 75,
  "competitorAnalysis": {
    "avgWordCount": 1200,
    "commonHeadings": ["المميزات", "طريقة الاستخدام", "الأسئلة الشائعة", "لماذا تختارنا"],
    "commonKeywords": ["جودة عالية", "ضمان", "توصيل سريع"],
    "hasFaq": true
  },
  "gaps": {
    "missingSections": ["قسم المواصفات التقنية", "قسم تجارب العملاء"],
    "missingKeywords": ["أفضل سعر", "مراجعة"],
    "contentDepth": "المحتوى يحتاج لزيادة التفاصيل في قسم الاستخدام"
  },
  "solutions": {
    "suggestedHeadings": ["دليل الاستخدام الشامل", "المواصفات الفنية الدقيقة"],
    "suggestedParagraphs": [
      { "title": "دليل الاستخدام", "content": "هنا فقرة محتوى مقترحة..." }
    ],
    "recommendedKeywords": ["كلمة 1", "كلمة 2"]
  }
}`;

      const result = await callGeminiAPI('keywords', prompt, "أنت خبير سيو متخصص في تحليل فجوة المحتوى والمنافسين.");
      
      let parsedResult;
      if (typeof result === 'string') {
        try {
          const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedResult = JSON.parse(jsonStr);
        } catch (e) {
          console.error('Failed to parse JSON from Gemini', e);
          return;
        }
      } else {
        parsedResult = result;
      }
      
      setGapData(parsedResult);
      toast.success('تم تحليل فجوة المحتوى بنجاح');
    } catch (error) {
      console.error('Error analyzing content gap:', error);
      toast.error('حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  };

  const addMissingContent = async () => {
    if (!gapData) return;
    setGeneratingContent(true);
    try {
      const prompt = `بناءً على تحليل الفجوة السابق للكلمة المفتاحية "${data.keywords.primary[0]}"، قم بتوليد محتوى كامل للأقسام المفقودة التالية: ${gapData.gaps.missingSections.join(', ')}.
      اجعل المحتوى احترافياً، متوافقاً مع السيو، وجاهزاً للنسخ.`;

      const result = await callGeminiAPI('keywords', prompt, "أنت كاتب محتوى سيو محترف.");
      handleCopy(result, 'auto-content');
      toast.success('تم توليد المحتوى الناقص ونسخه للحافظة');
    } catch (error) {
      console.error('Error generating missing content:', error);
      toast.error('حدث خطأ أثناء توليد المحتوى');
    } finally {
      setGeneratingContent(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <BarChart size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Content Gap Analyzer</h3>
            <p className="text-slate-500 text-sm font-bold">تحليل الفجوة التنافسية وتطوير المحتوى</p>
          </div>
        </div>

        <button
          onClick={analyzeGap}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
          بدء تحليل الفجوة
        </button>
      </div>

      {!gapData && !loading && (
        <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <AlertTriangle size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">ابدأ التحليل لاكتشاف ما ينقص محتواك لتتصدر النتائج</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 space-y-4">
          <Loader2 size={40} className="mx-auto text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">جاري فحص المنافسين وتحليل الفجوات...</p>
        </div>
      )}

      {gapData && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Quality Score & Summary */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
              <p className="text-xs font-black text-indigo-400 uppercase mb-2">نسبة جودة المحتوى</p>
              <div className="text-4xl font-black text-indigo-600">{gapData.qualityScore}%</div>
              <p className="text-[10px] text-indigo-400 mt-2">مقارنة بأفضل 5 منافسين</p>
            </div>
            <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-100 flex items-center">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">ملخص التحليل</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{gapData.gaps.contentDepth}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Gaps Found */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-700 text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" /> الفجوات المكتشفة
              </h4>
              <div className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase mb-2">أقسام مفقودة</p>
                  <div className="flex flex-wrap gap-2">
                    {gapData.gaps.missingSections.map((s, i) => (
                      <span key={i} className="text-xs bg-white text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase mb-2">كلمات مفتاحية مفقودة</p>
                  <div className="flex flex-wrap gap-2">
                    {gapData.gaps.missingKeywords.map((k, i) => (
                      <span key={i} className="text-xs bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100 font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Solutions */}
            <div className="space-y-4">
              <h4 className="font-black text-slate-700 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" /> الحلول المقترحة
              </h4>
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-3xl p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">عناوين H2/H3 مقترحة</p>
                  <div className="space-y-2">
                    {gapData.solutions.suggestedHeadings.map((h, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-indigo-50">
                        <span className="text-xs font-bold text-slate-700">{h}</span>
                        <button onClick={() => handleCopy(h, `h-${i}`)} className="text-indigo-400 hover:text-indigo-600">
                          {copied === `h-${i}` ? <CheckCircle size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={addMissingContent}
                  disabled={generatingContent}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
                >
                  {generatingContent ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  إضافة المحتوى الناقص تلقائيًا
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
