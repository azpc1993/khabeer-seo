'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Check, 
  Shield, 
  Loader2, 
  Sparkles, 
  FileText, 
  Clipboard,
  Tag,
  AlignRight,
  Award,
  Search,
  Info,
  Globe,
  LucideIcon
} from 'lucide-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { 
  CrystalCard, 
  SoftSolidCard, 
  PrimaryButton 
} from '@/components/EliteUI'
import { stripHtmlTags } from "@/lib/clipboard"

const GoogleSnippetPreview = dynamic(() => import('@/components/GoogleSnippetPreview'), { ssr: false });
const SallaProductDesc = dynamic(() => import('@/components/SallaProductDesc'), { ssr: false });

interface ResultsViewProps {
  result: string
  pk: string
  productName: string
  seoTitle: string
  metaDescription: string
  copied: boolean
  summaryCopied: boolean
  plagiarismLoading: boolean
  plagiarismResult: { score: number, details: string } | null
  checkPlagiarism: () => void
  copyToClipboard: () => void
  copySummary: () => void
  copySection: (text: string, label: string) => void
  highlightText: (text: string, keywords: string[]) => string
  generateMode?: string
}

const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  pk,
  productName: initialProductName,
  seoTitle: initialSeoTitle,
  metaDescription: initialMetaDescription,
  copied,
  summaryCopied,
  plagiarismLoading,
  plagiarismResult,
  checkPlagiarism,
  copyToClipboard,
  copySummary,
  copySection,
  highlightText,
  generateMode
}) => {
  const labels = [
    'اسم المنتج:',
    'اسم المنتج التسويقي:',
    'عنوان السيو:',
    'وصف الميتا:',
    'وصف المنتج:',
    'نص المحتوى (وصف المنتج/مقال/وصف فئة):',
    'المواصفات:',
    'النقاط الرئيسية/المواصفات:',
    'نقاط التميز التنافسية:',
    'Slug URL (بالعربية):',
    'نص Alt للصورة:',
    'دعوة لاتخاذ إجراء (CTA):'
  ];

  const parsed: Record<string, string> = {};

  labels.forEach(label => {
    if (result.includes(label)) {
      const start = result.indexOf(label) + label.length;
      let end = result.length;
      
      labels.forEach(nextLabel => {
        const nextIdx = result.indexOf(nextLabel, start);
        if (nextIdx !== -1 && nextIdx < end) {
          end = nextIdx;
        }
      });

      let value = result.substring(start, end).trim();
      
      // Clean surrounding ** markers if they wrap the entire value
      while ((value.startsWith('**') && value.endsWith('**')) || (value.startsWith('"') && value.endsWith('"'))) {
        if (value.startsWith('**') && value.endsWith('**')) {
          value = value.substring(2, value.length - 2).trim();
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1).trim();
        }
      }
      
      parsed[label] = value;
    }
  });

  const productName = parsed['اسم المنتج:'] || parsed['اسم المنتج التسويقي:'] || initialProductName;
  const productDesc = parsed['وصف المنتج:'] || parsed['نص المحتوى (وصف المنتج/مقال/وصف فئة):'];
  const specs = parsed['المواصفات:'] || parsed['النقاط الرئيسية/المواصفات:'];
  const usps = parsed['نقاط التميز التنافسية:'];
  const seoTitle = parsed['عنوان السيو:'] || initialSeoTitle;
  const metaDesc = parsed['وصف الميتا:'] || initialMetaDescription;
  const slug = parsed['Slug URL (بالعربية):'];
  const altText = parsed['نص Alt للصورة:'];
  const cta = parsed['دعوة لاتخاذ إجراء (CTA):'];

  const SectionCard = ({ 
    title, 
    content, 
    onCopy, 
    isLong = true, 
    icon: SectionIcon = FileText,
    color = "indigo"
  }: { 
    title: string, 
    content: string, 
    onCopy: () => void, 
    isLong?: boolean,
    icon?: LucideIcon,
    color?: string
  }) => {
    const CardComponent = isLong ? SoftSolidCard : CrystalCard;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full"
      >
        <CardComponent className={`group relative border-none shadow-sm hover:shadow-md transition-all duration-500 overflow-hidden ${!isLong ? 'py-4 px-6' : ''}`}>
          <div className={`flex items-center justify-between ${isLong ? 'mb-5 pb-4 border-b border-slate-50/80' : 'mb-2'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${color}-50 text-${color}-500 rounded-xl`}>
                <SectionIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                {title}
              </h3>
            </div>
            <button 
              onClick={onCopy}
              className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-xl hover:bg-${color}-100 transition-all active:scale-90 shadow-sm`}
              title={`نسخ ${title}`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className={`prose prose-slate max-w-none prose-p:leading-relaxed prose-strong:text-red-600 prose-strong:font-black prose-strong:bg-red-50 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded-md prose-ul:list-disc prose-ul:ps-5 prose-li:mb-2 prose-li:text-slate-700 ${isLong ? 'text-base' : 'text-lg font-black text-slate-800'}`}>
            <Markdown remarkPlugins={[remarkGfm]}>{highlightText(stripHtmlTags(content), pk.split(','))}</Markdown>
          </div>
        </CardComponent>
      </motion.div>
    );
  };

  if (generateMode === 'seo-check') {
    const seoScoreMatch = result.match(/SEO Score:\s*(\d+)/i);
    const seoScore = seoScoreMatch ? seoScoreMatch[1] : '';

    const strengthsMatch = result.match(/نقاط القوة:\s*([\s\S]*?)(?=نقاط الضعف:)/i);
    const strengths = strengthsMatch ? strengthsMatch[1].trim() : '';

    const weaknessesMatch = result.match(/نقاط الضعف:\s*([\s\S]*?)(?=تحسين مقترح:)/i);
    const weaknesses = weaknessesMatch ? weaknessesMatch[1].trim() : '';

    const suggestionsMatch = result.match(/تحسين مقترح:\s*([\s\S]*)/i);
    const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';

    return (
      <section className="flex-1 space-y-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-100">
                <Search className="w-5 h-5" />
              </div>
              نتائج تحليل السيو
            </h2>
            <p className="text-sm font-bold text-slate-500 mr-12">تحليل شامل لصفحة المنتج وتوصيات التحسين</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <PrimaryButton
              onClick={copyToClipboard}
              className="px-6 py-3 text-sm w-full sm:w-auto justify-center"
            >
              <div className="flex items-center justify-center gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ بنجاح' : 'نسخ التقرير بالكامل'}</span>
              </div>
            </PrimaryButton>
          </div>
        </div>

        <div className="space-y-6 pb-10">
          {seoScore && (
            <SectionCard 
              title="SEO Score" 
              content={`${seoScore} / 100`} 
              onCopy={() => copySection(seoScore, 'SEO Score')} 
              isLong={false}
              icon={Award}
              color="emerald"
            />
          )}

          {strengths && (
            <SectionCard 
              title="نقاط القوة" 
              content={strengths} 
              onCopy={() => copySection(strengths, 'نقاط القوة')} 
              icon={Check}
              color="indigo"
            />
          )}

          {weaknesses && (
            <SectionCard 
              title="نقاط الضعف" 
              content={weaknesses} 
              onCopy={() => copySection(weaknesses, 'نقاط الضعف')} 
              icon={Info}
              color="amber"
            />
          )}

          {suggestions && (
            <SectionCard 
              title="تحسين مقترح" 
              content={suggestions} 
              onCopy={() => copySection(suggestions, 'تحسين مقترح')} 
              icon={Sparkles}
              color="purple"
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 space-y-8 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            المحتوى المولد ذكياً
          </h2>
          <p className="text-sm font-bold text-slate-500 mr-12">تم تحسين المحتوى ليتوافق مع معايير السيو وتجربة المستخدم</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={checkPlagiarism}
            disabled={plagiarismLoading}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-black text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 rounded-2xl transition-all shadow-sm disabled:opacity-50 active:scale-95 w-full sm:w-auto"
          >
            {plagiarismLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            فحص الأصالة
          </button>
          
          <PrimaryButton
            onClick={copyToClipboard}
            className="px-6 py-3 text-sm w-full sm:w-auto justify-center"
          >
            <div className="flex items-center justify-center gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ بنجاح' : 'نسخ المحتوى بالكامل'}</span>
            </div>
          </PrimaryButton>
        </div>
      </div>

      {plagiarismResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-900">نتيجة فحص الأصالة</h4>
              <p className="text-xs font-bold text-emerald-600/80 mt-1">{plagiarismResult.details}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-emerald-600">{plagiarismResult.score}%</span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">فريد</span>
          </div>
        </motion.div>
      )}

      <div className="space-y-6 pb-10">
        <div className="flex items-center justify-between mb-8">
          <CrystalCard className="py-3 px-6 border-none shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-black text-slate-700">نتائج تحليل السيو الذكي</span>
          </CrystalCard>
        </div>

        {/* 1. Product Name */}
        {productName && (
          <SectionCard 
            title="اسم المنتج" 
            content={productName} 
            onCopy={() => copySection(productName, 'اسم المنتج')} 
            isLong={false}
            icon={Tag}
            color="indigo"
          />
        )}

        {/* 2. Product Description + Specifications */}
        {(productDesc || specs) && (
          <SectionCard 
            title="وصف المنتج والمواصفات" 
            content={`${productDesc || ''}\n\n${specs ? `### المواصفات الفنية:\n${specs}` : ''}`} 
            onCopy={() => {
              const combined = `${productDesc || ''}\n\nالمواصفات:\n${specs || ''}`;
              copySection(combined, 'الوصف والمواصفات');
            }} 
            icon={AlignRight}
            color="purple"
          />
        )}

        {/* 3. USPs */}
        {usps && (
          <SectionCard 
            title="نقاط التميز التنافسية (USPs)" 
            content={usps} 
            onCopy={() => copySection(usps, 'نقاط التميز')} 
            icon={Award}
            color="amber"
          />
        )}

        {/* 4. SEO Title */}
        {seoTitle && (
          <SectionCard 
            title="عنوان السيو (SEO Title)" 
            content={seoTitle} 
            onCopy={() => copySection(seoTitle, 'عنوان السيو')} 
            isLong={false}
            icon={Search}
            color="emerald"
          />
        )}

        {/* 5. Meta Description */}
        {metaDesc && (
          <SectionCard 
            title="وصف الميتا (Meta Description)" 
            content={metaDesc} 
            onCopy={() => copySection(metaDesc, 'وصف الميتا')} 
            icon={Info}
            color="cyan"
          />
        )}

        {/* 6, 7, 8. SEO Elements & Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <SoftSolidCard className="border-none shadow-sm hover:shadow-md transition-all duration-500 p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                عناصر السيو الإضافية والمعاينة
              </h3>
              <div className="flex items-center gap-2">
                <SallaProductDesc aiOutput={productDesc || ''} specifications={specs || ''} primaryKeywords={pk.split(',')} />
                <button 
                  onClick={() => {
                    const combined = `${productDesc || ''}\n\nالمواصفات:\n${specs || ''}`;
                    copySection(combined, 'الوصف والمواصفات');
                  }}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-90"
                  title="نسخ الوصف والمواصفات معاً"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="mb-12">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 mr-1">معاينة نتيجة البحث في جوجل</h4>
              <CrystalCard className="border-none shadow-inner bg-slate-50/30 p-6">
                <GoogleSnippetPreview 
                  title={seoTitle || ''} 
                  description={metaDesc || ''} 
                  url={`https://yourstore.com/${slug || ''}`} 
                />
              </CrystalCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Slug URL المقترح</label>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-600 truncate ltr">{slug || 'سيظهر هنا'}</span>
                  <button onClick={() => copySection(slug || '', 'Slug URL')} className="p-2 text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">نص Alt للصورة</label>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-600 truncate">{altText || 'سيظهر هنا'}</span>
                  <button onClick={() => copySection(altText || '', 'نص Alt')} className="p-2 text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {cta && (
              <div className="mt-8 pt-8 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block mb-4">عبارة الحث على اتخاذ إجراء (CTA)</label>
                <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-center justify-between group">
                  <span className="text-base font-black text-indigo-900">{cta}</span>
                  <button onClick={() => copySection(cta, 'CTA')} className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </SoftSolidCard>
        </motion.div>

        {/* Structured Highlights */}
        <div className="grid md:grid-cols-2 gap-6 pt-8 border-t border-slate-100/50">
          <SoftSolidCard className="p-6 border-none shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              الكلمات المستهدفة (PKs)
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {pk.split(',').map((keyword, i) => (
                <span key={i} className="px-4 py-2 bg-slate-50/80 border border-slate-100/50 text-slate-700 text-[11px] font-black rounded-xl shadow-sm hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-all cursor-default">
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </SoftSolidCard>

          <SoftSolidCard className="p-6 border-none shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                <Check className="w-4 h-4" />
              </div>
              ملخص السيو السريع
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>طول العنوان:</span>
                <span className="text-slate-800">{(seoTitle || '').length} حرف</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>طول وصف الميتا:</span>
                <span className="text-slate-800">{(metaDesc || '').length} حرف</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={copySummary}
                  className="w-full py-2.5 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {summaryCopied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                  {summaryCopied ? 'تم نسخ الملخص' : 'نسخ ملخص السيو'}
                </button>
              </div>
            </div>
          </SoftSolidCard>
        </div>
      </div>
    </section>
  )
}

export default ResultsView;
