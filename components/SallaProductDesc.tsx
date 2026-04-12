import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

type SallaProductDescProps = {
  aiOutput?: string;
  specifications?: string;
  primaryKeywords?: string[];
};

const SallaProductDesc = ({
  aiOutput = '',
  specifications = '',
  primaryKeywords = [],
}: SallaProductDescProps) => {
  const [copied, setCopied] = useState(false);

  // 1) تنظيف Markdown إلى نص نظيف
  const processMarkdown = (text: string): string => {
    if (!text) return '';

    return text
      .replace(/\r\n/g, '\n')
      .replace(/^#{1,6}\s+/gm, '') // إزالة عناوين markdown
      .replace(/`([^`]+)`/g, '$1') // إزالة backticks
      .replace(/^---$/gm, '') // إزالة الخطوط الفاصلة
      .replace(/^___$/gm, '')
      .replace(/\*(.*?)\*/g, '$1') // إزالة italic
      .replace(/^\s*[-*+]\s+/gm, '• ') // تحويل bullet البرمجية إلى bullet نصية
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // 2) حماية HTML
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 3) تمييز الكلمات المفتاحية وتنسيق Bold
  const highlightAndFormat = (text: string, keywords: string[]): string => {
    if (!text) return '';

    // أولاً: حماية النص من الـ HTML
    let result = escapeHtml(text);

    // ثانياً: معالجة الـ Bold من الـ Markdown الأصلي
    // نستخدم span بدلاً من strong لتجنب التداخل مع أدوات التنسيق في المتجر
    result = result.replace(/\*\*(.*?)\*\*/g, '<span style="color: #dc2626; background-color: #fef2f2; padding: 2px 4px; border-radius: 4px; font-weight: bold;">$1</span>');

    // ثالثاً: تمييز الكلمات المفتاحية الإضافية
    if (keywords?.length) {
      const sortedKeywords = [...keywords]
        .filter(Boolean)
        .map((k) => k.trim())
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

      for (const keyword of sortedKeywords) {
        const escapedKeyword = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // نتجنب استبدال الكلمات التي أصبحت بالفعل داخل وسم span المنسق
        const regex = new RegExp(`(?<!<span[^>]*>)(?<!>)${escapedKeyword}(?![^<]*</span>)`, 'gi');

        result = result.replace(
          regex,
          `<span style="color: #dc2626; background-color: #fef2f2; padding: 2px 4px; border-radius: 4px; font-weight: bold;">$&</span>`
        );
      }
    }

    return result;
  };

  // 4) تحويل الوصف + المواصفات إلى HTML متوافق مع سلة
  const formatForSalla = (
    description: string,
    specs: string,
    keywords: string[]
  ): string => {
    const cleanDesc = processMarkdown(description);
    const cleanSpecs = processMarkdown(specs);

    let htmlBody = '';
    let isInList = false;

    // معالجة الوصف (الفقرات والقوائم)
    if (cleanDesc) {
      const lines = cleanDesc.split('\n').map(l => l.trim()).filter(Boolean);
      
      for (const line of lines) {
        if (line.startsWith('• ')) {
          if (!isInList) {
            htmlBody += `<ul style="list-style-type:disc; padding-right:15px; margin-bottom:14px; direction:rtl; text-align:right;">`;
            isInList = true;
          }
          htmlBody += `<li style="margin-bottom:8px; line-height:1.8;">${highlightAndFormat(line.substring(2), keywords)}</li>`;
        } else {
          if (isInList) {
            htmlBody += `</ul>`;
            isInList = false;
          }
          htmlBody += `<p style="margin-bottom:14px; line-height:1.8; direction:rtl; text-align:right;">${highlightAndFormat(line, keywords)}</p>`;
        }
      }
      if (isInList) htmlBody += `</ul>`;
    }

    // المواصفات
    if (cleanSpecs) {
      htmlBody += `<p style="margin-top:18px; margin-bottom:10px; direction:rtl; text-align:right;"><span style="text-decoration: underline; font-weight: bold;">المواصفات:</span></p>`;
      htmlBody += `<ul style="list-style-type:disc; padding-right:25px; margin:0; direction:rtl; text-align:right;">`;

      const specLines = cleanSpecs.split('\n').map((line) => line.trim()).filter(Boolean);

      for (const line of specLines) {
        if (line.includes(':')) {
          const [label, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          // نستخدم span للتنسيق الداخلي لتجنب تداخل الـ strong
          htmlBody += `<li style="margin-bottom:8px; line-height:1.8; direction:rtl; text-align:right;"><span style="font-weight: bold;">${highlightAndFormat(label.trim(), keywords)}:</span> ${highlightAndFormat(value, keywords)}</li>`;
        } else {
          htmlBody += `<li style="margin-bottom:8px; line-height:1.8; direction:rtl; text-align:right;">${highlightAndFormat(line, keywords)}</li>`;
        }
      }
      htmlBody += `</ul>`;
    }

    return htmlBody.trim();
  };

  // 5) بناء plain text احتياطي
  const buildPlainText = (description: string, specs: string): string => {
    const cleanDesc = processMarkdown(description).replace(/\*\*/g, '');
    const cleanSpecs = processMarkdown(specs).replace(/\*\*/g, '');
    return [cleanDesc, cleanSpecs ? `المواصفات:\n${cleanSpecs}` : ''].filter(Boolean).join('\n\n').trim();
  };

  // 6) النسخ المنسق
  const handleCopy = async () => {
    const htmlContent = formatForSalla(aiOutput, specifications, primaryKeywords);
    const plainText = buildPlainText(aiOutput, specifications);

    try {
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل النسخ المنسق:', err);
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className={`p-3 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
          copied ? 'bg-green-50 text-green-600' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:bg-emerald-900/20'
        }`}
        title="نسخ لوصف المتجر"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default SallaProductDesc;
