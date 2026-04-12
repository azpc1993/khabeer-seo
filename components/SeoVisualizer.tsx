import React, { useState } from 'react';
import { 
  Search, AlertCircle, CheckCircle, Copy, ArrowUpRight, 
  Zap, LayoutGrid, FileText, Image as ImageIcon, BarChart3, XCircle, Hash
} from 'lucide-react';
import { SeoMetrics } from '@/services/seoAnalyzer';
import { SmartSeoSuggestions } from './SmartSeoSuggestions';
import { ContentGapAnalyzer } from './ContentGapAnalyzer';
import { AiSeoOptimizer } from './AiSeoOptimizer';
import { copyToClipboard } from '@/lib/clipboard';

interface Props {
  data: SeoMetrics;
  onActionClick: (type: string) => void; // للتوجيه لصفحة التوليد
}

const SeoVisualizer: React.FC<Props> = ({ data, onActionClick }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const getScoreStyles = (score: number) => {
    if (score >= 70) return { color: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', label: 'ممتاز' };
    if (score >= 40) return { color: 'text-yellow-600', border: 'border-yellow-200', bg: 'bg-yellow-50', label: 'جيد' };
    return { color: 'text-red-600', border: 'border-red-200', bg: 'bg-red-50', label: 'ضعيف' };
  };

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const styles = getScoreStyles(data.score);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8 animate-in fade-in duration-700">
      
      {/* 2) الملخص التنفيذي (Executive Summary) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-[6px] ${styles.border} ${styles.bg}`}>
             <span className={`text-4xl font-black ${styles.color}`}>{data.score}</span>
             <span className="absolute -bottom-2 bg-white px-3 py-1 rounded-full text-xs font-bold border border-slate-100 shadow-sm">/ 100</span>
          </div>
          
          <div className="flex-1 space-y-3 text-center md:text-right">
            <h2 className="text-2xl font-bold text-slate-800">تحليل الأداء العام: {styles.label}</h2>
            <p className="text-slate-500 text-lg">
              {data.score >= 70 
                ? "موقعك مهيأ بشكل جيد جداً، مع وجود فرص بسيطة للتحسين لزيادة السيطرة." 
                : "هناك ثغرات أساسية تمنع محركات البحث من فهم محتوى صفحتك بشكل كامل."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
              <span className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg leading-none">
                <AlertCircle size={14} /> {data.recommendations.length} مشاكل مكتشفة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3) قسم البيانات الفعلية (Real Metrics Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'حجم المحتوى', val: `${data.wordCount} كلمة`, icon: FileText },
          { label: 'إجمالي الصور', val: data.imagesCount, icon: ImageIcon },
          { label: 'صور بلا Alt', val: data.imagesWithoutAlt, icon: XCircle, color: data.imagesWithoutAlt > 0 ? 'text-red-500' : 'text-green-500' },
          { label: 'وسم H1', val: data.hasH1 ? 'موجود' : 'مفقود', icon: Hash, color: data.hasH1 ? 'text-green-500' : 'text-red-500' },
          { label: 'وصف الميتا', val: data.hasMetaDescription ? 'موجود' : 'مفقود', icon: Search, color: data.hasMetaDescription ? 'text-green-500' : 'text-red-500' },
        ].map((item, i) => {
          const IconComponent = item.icon as React.ElementType;
          return (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-50 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-slate-50 rounded-lg mb-3 text-slate-400">
              <IconComponent size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className={`text-base font-bold mt-1 ${item.color || 'text-slate-800'}`}>{item.val}</p>
          </div>
        )})}
      </div>

      {/* 7) الأولويات السريعة (ابدأ من هنا) */}
      <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
        <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
          <Zap size={20} className="fill-indigo-500 text-indigo-500" /> ابدأ من هنا (أولويات قصوى)
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {data.recommendations.filter(r => r.priority === 'High').map((rec, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200 hover:shadow-md transition">
              <h4 className="font-bold text-slate-800 text-sm mb-2">{rec.title}</h4>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{rec.reason}</p>
              <button 
                onClick={() => onActionClick(rec.actionType)}
                className="w-full text-xs bg-purple-600 text-white font-bold py-2.5 rounded-xl hover:bg-purple-700 transition"
              >
                إصلاح الآن
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4) تحسين قسم الكلمات المفتاحية */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <LayoutGrid size={18} className="text-purple-500" /> توزيع الكلمات المفتاحية
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">الأساسية (Primary)</p>
              <div className="flex flex-wrap gap-2">
                {data.keywords.primary.map(kw => (
                  <button key={kw} onClick={() => handleCopy(kw)} className="group flex items-center gap-2 text-xs bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                    {kw} {copied === kw ? <CheckCircle size={12} className="text-green-500" /> : <Copy size={12} className="opacity-0 group-hover:opacity-100 transition" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase">مقترحة غير موجودة (Missing)</p>
              <div className="flex flex-wrap gap-2">
                {data.keywords.missing.map(kw => (
                  <span key={kw} className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-100 font-medium">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6) تحسين عرض التحسينات المقترحة */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-500" /> قائمة التحسينات التفصيلية
          </h3>
          {data.recommendations.map((rec) => (
            <div key={rec.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter ${getPriorityStyle(rec.priority)}`}>
                  {rec.priority === 'High' ? 'أولوية قصوى' : rec.priority === 'Medium' ? 'متوسطة' : 'منخفضة'}
                </span>
                <button onClick={() => onActionClick(rec.actionType)} className="text-slate-400 group-hover:text-purple-600 transition">
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">{rec.title}</h4>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 leading-relaxed"><span className="text-slate-400 font-semibold">السبب:</span> {rec.reason}</p>
                <p className="text-xs text-green-600 leading-relaxed font-medium"><span className="text-slate-400">التأثير:</span> {rec.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart SEO Suggestions (H1/H2 & Keyword Integration) */}
      <SmartSeoSuggestions data={data} />

      {/* Content Gap Analyzer */}
      <ContentGapAnalyzer data={data} />

      {/* AI SEO Optimizer (All-in-One) */}
      <AiSeoOptimizer data={data} />

    </div>
  );
};

export default SeoVisualizer;
