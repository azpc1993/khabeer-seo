import React, { useState, useEffect } from 'react';
import { callGeminiAPI } from '@/lib/api';
import { SeoMetrics } from '@/services/seoAnalyzer';
import { Loader2, Copy, CheckCircle, Heading, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/clipboard';

interface SmartSeoSuggestionsProps {
  data: SeoMetrics;
}

interface SuggestionsData {
  headingStructure: {
    status: 'suitable' | 'needs_improvement';
    suggestedH1: string;
    suggestedH2s: string[];
  };
  keywordIntegration: {
    status: 'weak' | 'medium' | 'good';
    analysis: string;
    suggestedTitle: string;
    suggestedMeta: string;
    improvedParagraph: string;
  };
}

export const SmartSeoSuggestions: React.FC<SmartSeoSuggestionsProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!data.extractedTexts) return;
      
      setLoading(true);
      try {
        const prompt = `أنت خبير سيو محترف. قم بتحليل البيانات التالية لصفحة ويب وتقديم اقتراحات ذكية لتحسينها:

البيانات المستخرجة:
- الكلمات المفتاحية الأساسية: ${data.keywords.primary.join(', ')}
- الكلمات الثانوية (LSI): ${data.keywords.lsi.join(', ')}
- عنوان الصفحة الحالي: ${data.extractedTexts.title || 'غير موجود'}
- وصف الميتا الحالي: ${data.extractedTexts.metaDescription || 'غير موجود'}
- عنوان H1 الحالي: ${data.extractedTexts.h1 || 'غير موجود'}
- عناوين H2 الحالية: ${data.extractedTexts.h2s.join(' | ') || 'غير موجود'}
- أول فقرة في الصفحة: ${data.extractedTexts.firstParagraph || 'غير موجود'}

المطلوب إرجاعه بصيغة JSON فقط:
{
  "headingStructure": {
    "status": "suitable" | "needs_improvement",
    "suggestedH1": "عنوان H1 مقترح يدمج الكلمة المفتاحية بشكل طبيعي",
    "suggestedH2s": ["عنوان H2 مقترح 1", "عنوان H2 مقترح 2", "عنوان H2 مقترح 3"]
  },
  "keywordIntegration": {
    "status": "weak" | "medium" | "good",
    "analysis": "تحليل مختصر لأماكن الدمج الحالية",
    "suggestedTitle": "عنوان صفحة مقترح",
    "suggestedMeta": "وصف ميتا مقترح",
    "improvedParagraph": "فقرة وصف محسنة تحتوي على الكلمة المفتاحية الأساسية وLSI بشكل طبيعي بدون حشو"
  }
}`;

        const result = await callGeminiAPI('keywords', prompt, "أنت خبير سيو متخصص في تحليل بنية الصفحات ودمج الكلمات المفتاحية بذكاء.");
        
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
        
        setSuggestions(parsedResult);
      } catch (error) {
        console.error('Error fetching smart suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [data]);

  if (!data.extractedTexts) return null;

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4 mt-8">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-slate-500 font-medium">جاري تحليل بنية العناوين ودمج الكلمات المفتاحية بذكاء...</p>
      </div>
    );
  }

  if (!suggestions) return null;

  const copyHeadingStructure = () => {
    const text = `H1: ${suggestions.headingStructure.suggestedH1}\n\nH2:\n${suggestions.headingStructure.suggestedH2s.map(h => `- ${h}`).join('\n')}`;
    handleCopy(text, 'headings');
  };

  const copyKeywordIntegration = () => {
    const text = `العنوان: ${suggestions.keywordIntegration.suggestedTitle}\n\nالوصف: ${suggestions.keywordIntegration.suggestedMeta}\n\nالفقرة المحسنة:\n${suggestions.keywordIntegration.improvedParagraph}`;
    handleCopy(text, 'keywords');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      {/* Heading Structure Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10" />
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Heading size={20} className="text-blue-500" /> بنية العناوين المقترحة
          </h3>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${suggestions.headingStructure.status === 'suitable' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {suggestions.headingStructure.status === 'suitable' ? 'مناسبة' : 'تحتاج تحسين'}
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-md mb-2 inline-block">H1</span>
            <p className="text-slate-800 font-bold text-sm">{suggestions.headingStructure.suggestedH1}</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-md mb-2 inline-block">H2</span>
            <ul className="space-y-2">
              {suggestions.headingStructure.suggestedH2s.map((h2, idx) => (
                <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span> {h2}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button 
          onClick={copyHeadingStructure}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
        >
          {copied === 'headings' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
          نسخ البنية المقترحة
        </button>
      </div>

      {/* Keyword Integration Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -z-10" />
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Sparkles size={20} className="text-purple-500" /> دمج الكلمات بذكاء
          </h3>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            suggestions.keywordIntegration.status === 'good' ? 'bg-green-100 text-green-700' : 
            suggestions.keywordIntegration.status === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
          }`}>
            {suggestions.keywordIntegration.status === 'good' ? 'جيد' : suggestions.keywordIntegration.status === 'medium' ? 'متوسط' : 'ضعيف'}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {suggestions.keywordIntegration.analysis}
          </p>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">عنوان مقترح</span>
              <p className="text-sm font-bold text-slate-800">{suggestions.keywordIntegration.suggestedTitle}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">وصف ميتا مقترح</span>
              <p className="text-sm text-slate-600">{suggestions.keywordIntegration.suggestedMeta}</p>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
              <span className="text-[10px] font-bold text-purple-500 uppercase mb-1 block">فقرة محسنة (تتضمن الكلمات المفتاحية)</span>
              <p className="text-sm text-slate-700 leading-relaxed">{suggestions.keywordIntegration.improvedParagraph}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={copyKeywordIntegration}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-3 rounded-xl transition-colors text-sm border border-purple-100"
        >
          {copied === 'keywords' ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
          نسخ المحتوى المحسن
        </button>
      </div>
    </div>
  );
};
