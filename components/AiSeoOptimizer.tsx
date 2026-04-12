import React, { useState } from 'react';
import { callGeminiAPI } from '@/lib/api';
import { SeoMetrics } from '@/services/seoAnalyzer';
import { 
  Loader2, Copy, CheckCircle, Sparkles, Layout, 
  FileText, HelpCircle, Code, Settings2, Rocket, 
  Target, ShieldCheck, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';

interface AiSeoOptimizerProps {
  data: SeoMetrics;
}

interface OptimizedContent {
  seoTitle: string;
  h1: string;
  h2s: string[];
  productDescription: string;
  metaDescription: string;
  faqs: { question: string; answer: string }[];
  schema: string;
}

type OptimizationLevel = 'normal' | 'professional' | 'competitor';

export const AiSeoOptimizer: React.FC<AiSeoOptimizerProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<OptimizationLevel>('professional');
  const [result, setResult] = useState<OptimizedContent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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

  const optimizeContent = async () => {
    setLoading(true);
    try {
      const levelText = 
        level === 'normal' ? 'تحسين عادي ومتوازن' : 
        level === 'professional' ? 'تحسين احترافي متقدم للسيو' : 
        'تحسين هجومي للمنافسة القوية وتصدر النتائج';

      const prompt = `أنت خبير سيو عالمي. قم بإجراء تحسين شامل (All-in-One) لمحتوى الصفحة بناءً على البيانات التالية:

الكلمات المفتاحية: ${data.keywords.primary.join(', ')}
الكلمات الثانوية (LSI): ${data.keywords.lsi.join(', ')}
المحتوى الحالي: ${data.extractedTexts?.title || ''} | ${data.extractedTexts?.metaDescription || ''}
مستوى التحسين المطلوب: ${levelText}

المطلوب توليد محتوى نهائي جاهز للنشر يتضمن:
1. عنوان SEO جذاب ومحسن.
2. عنوان H1 رئيسي قوي.
3. قائمة عناوين H2 فرعية (4-6 عناوين) تغطي كافة جوانب المنتج/الموضوع.
4. وصف منتج احترافي ومطول يدمج الكلمات المفتاحية بذكاء طبيعي.
5. وصف ميتا (Meta Description) يحفز على النقر.
6. قائمة أسئلة وأجوبة (FAQ) من 5 أسئلة.
7. كود JSON-LD FAQ Schema كامل.

المطلوب إرجاعه بصيغة JSON فقط:
{
  "seoTitle": "...",
  "h1": "...",
  "h2s": ["...", "..."],
  "productDescription": "...",
  "metaDescription": "...",
  "faqs": [{"question": "...", "answer": "..."}],
  "schema": "..."
}`;

      const response = await callGeminiAPI('keywords', prompt, "أنت نظام AI متكامل لتحسين السيو وتوليد المحتوى النهائي الجاهز للنشر.");
      
      let parsedResult;
      if (typeof response === 'string') {
        try {
          const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedResult = JSON.parse(jsonStr);
        } catch (e) {
          console.error('Failed to parse JSON from Gemini', e);
          toast.error('فشل في معالجة النتائج');
          return;
        }
      } else {
        parsedResult = response;
      }
      
      setResult(parsedResult);
      toast.success('تم تحسين المحتوى بالكامل بنجاح');
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast.error('حدث خطأ أثناء التحسين الشامل');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = `
العنوان: ${result.seoTitle}
H1: ${result.h1}
العناوين الفرعية:
${result.h2s.map(h => `- ${h}`).join('\n')}

الوصف:
${result.productDescription}

وصف الميتا:
${result.metaDescription}

الأسئلة الشائعة:
${result.faqs.map(f => `س: ${f.question}\nج: ${f.answer}`).join('\n\n')}
    `.trim();
    handleCopy(text, 'all');
  };

  return (
    <div className="bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-800 shadow-2xl mt-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Rocket size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              AI SEO Optimizer <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">PRO</span>
            </h3>
            <p className="text-slate-400 text-sm font-medium">نظام متكامل لتحسين كامل الصفحة بضغطة واحدة</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center bg-slate-800/50 rounded-2xl border border-slate-700 p-1.5 w-full md:w-auto">
            {[
              { id: 'normal', label: 'عادي', icon: ShieldCheck },
              { id: 'professional', label: 'احترافي', icon: Target },
              { id: 'competitor', label: 'منافس قوي', icon: Zap }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLevel(opt.id as OptimizationLevel)}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  level === opt.id 
                    ? 'bg-white text-slate-900 shadow-xl' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={optimizeContent}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-purple-900/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            تحسين كامل الصفحة
          </button>
        </div>
      </div>

      {!result && !loading && (
        <div className="text-center py-20 bg-slate-800/20 rounded-[2rem] border border-dashed border-slate-700">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings2 size={32} className="text-slate-600" />
          </div>
          <h4 className="text-white font-bold text-lg mb-2">جاهز للتحسين الشامل؟</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            سيقوم النظام بتحليل كافة الفجوات والكلمات المفتاحية وبناء محتوى نهائي متكامل جاهز للنشر مباشرة.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
              <Loader2 size={32} className="text-purple-500 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-black text-lg">جاري بناء المحتوى النهائي...</p>
            <p className="text-slate-500 text-xs">نقوم بدمج الكلمات، بناء العناوين، وتوليد الـ Schema بذكاء</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center">
            <h4 className="text-purple-400 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={16} /> النتيجة النهائية المحسنة
            </h4>
            <button 
              onClick={copyAll}
              className="text-xs font-black text-white bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-700"
            >
              {copied === 'all' ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              نسخ المحتوى بالكامل
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Content Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <Layout size={12} /> بنية العناوين (H1 & H2)
                  </span>
                  <button onClick={() => handleCopy(`${result.h1}\n\n${result.h2s.join('\n')}`, 'headings')} className="text-slate-400 hover:text-white">
                    {copied === 'headings' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <h1 className="text-xl font-black text-white mb-4">{result.h1}</h1>
                <div className="space-y-2">
                  {result.h2s.map((h, i) => (
                    <div key={i} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span> {h}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <FileText size={12} /> وصف المنتج المحسن
                  </span>
                  <button onClick={() => handleCopy(result.productDescription, 'desc')} className="text-slate-400 hover:text-white">
                    {copied === 'desc' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed text-justify">
                  {result.productDescription}
                </p>
              </div>
            </div>

            {/* Meta & Technical Column */}
            <div className="space-y-6">
              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <Target size={12} /> SEO & Meta
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-slate-500">SEO Title</span>
                      <button onClick={() => handleCopy(result.seoTitle, 'title')} className="text-slate-500 hover:text-white">
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">{result.seoTitle}</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-slate-500">Meta Description</span>
                      <button onClick={() => handleCopy(result.metaDescription, 'meta')} className="text-slate-500 hover:text-white">
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{result.metaDescription}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <HelpCircle size={12} /> الأسئلة الشائعة (FAQ)
                  </span>
                  <button onClick={() => handleCopy(result.faqs.map(f => `س: ${f.question}\nج: ${f.answer}`).join('\n\n'), 'faqs')} className="text-slate-400 hover:text-white">
                    {copied === 'faqs' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="space-y-3">
                  {result.faqs.slice(0, 3).map((f, i) => (
                    <div key={i} className="border-b border-slate-700/50 pb-2 last:border-0">
                      <p className="text-xs font-bold text-slate-200 mb-1">{f.question}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                    <Code size={12} /> JSON-LD Schema
                  </span>
                  <button onClick={() => handleCopy(result.schema, 'schema')} className="text-slate-400 hover:text-white">
                    {copied === 'schema' ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="bg-black/40 rounded-xl p-3 h-24 overflow-auto custom-scrollbar">
                  <pre className="text-[9px] text-emerald-500 font-mono text-left dir-ltr">
                    {result.schema}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
