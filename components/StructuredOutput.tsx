'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Copy, LucideIcon 
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CrystalCard, SoftSolidCard } from "@/components/EliteUI";
import { PrimaryButton } from "@/components/EliteUI";
import { highlightText } from '@/lib/utils';
import { stripHtmlTags } from '@/lib/clipboard';

interface StructuredOutputProps {
  result: string;
  pk: string;
  copyAll: (text: string) => void;
  onCopySection: (title: string, content: string) => void;
}

export const StructuredOutput = ({
  result,
  pk,
  copyAll,
  onCopySection
}: StructuredOutputProps) => {
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

  const SectionCard = ({ 
    title, 
    content, 
    onCopy, 
    isLong = true, 
    icon: SectionIcon = FileText,
    color = "emerald"
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

  const productName = parsed['اسم المنتج:'] || parsed['اسم المنتج التسويقي:'];
  const productDesc = parsed['وصف المنتج:'] || parsed['نص المحتوى (وصف المنتج/مقال/وصف فئة):'];
  const specs = parsed['المواصفات:'] || parsed['النقاط الرئيسية/المواصفات:'];
  const usps = parsed['نقاط التميز التنافسية:'];
  const seoTitle = parsed['عنوان السيو:'];
  const metaDesc = parsed['وصف الميتا:'];
  const slug = parsed['Slug URL (بالعربية):'];
  const altText = parsed['نص Alt للصورة:'];
  const cta = parsed['دعوة لاتخاذ إجراء (CTA):'];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between mb-8">
        <CrystalCard className="py-3 px-6 border-none shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-black text-slate-700">نتائج تحليل السيو الذكي</span>
        </CrystalCard>
        
        <PrimaryButton 
          onClick={() => copyAll(result)} 
          className="py-3 px-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            <span>نسخ التقرير كاملاً</span>
          </div>
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {productName && (
          <SectionCard 
            title="اسم المنتج" 
            content={productName} 
            onCopy={() => onCopySection('اسم المنتج', productName)}
            isLong={false}
            color="emerald"
          />
        )}
        {seoTitle && (
          <SectionCard 
            title="عنوان السيو" 
            content={seoTitle} 
            onCopy={() => onCopySection('عنوان السيو', seoTitle)}
            isLong={false}
            color="emerald"
          />
        )}
        {slug && (
          <SectionCard 
            title="Slug URL" 
            content={slug} 
            onCopy={() => onCopySection('Slug URL', slug)}
            isLong={false}
            color="amber"
          />
        )}
        {altText && (
          <SectionCard 
            title="نص Alt للصورة" 
            content={altText} 
            onCopy={() => onCopySection('نص Alt للصورة', altText)}
            isLong={false}
            color="rose"
          />
        )}
      </div>

      {metaDesc && (
        <SectionCard 
          title="وصف الميتا" 
          content={metaDesc} 
          onCopy={() => onCopySection('وصف الميتا', metaDesc)}
          color="purple"
        />
      )}

      {productDesc && (
        <SectionCard 
          title="وصف المنتج" 
          content={productDesc} 
          onCopy={() => onCopySection('وصف المنتج', productDesc)}
          color="blue"
        />
      )}

      {specs && (
        <SectionCard 
          title="المواصفات" 
          content={specs} 
          onCopy={() => onCopySection('المواصفات', specs)}
          color="cyan"
        />
      )}

      {usps && (
        <SectionCard 
          title="نقاط التميز" 
          content={usps} 
          onCopy={() => onCopySection('نقاط التميز', usps)}
          color="orange"
        />
      )}

      {cta && (
        <SectionCard 
          title="دعوة لاتخاذ إجراء" 
          content={cta} 
          onCopy={() => onCopySection('دعوة لاتخاذ إجراء', cta)}
          color="pink"
        />
      )}
    </div>
  );
};
