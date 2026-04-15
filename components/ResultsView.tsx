'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Copy, Check, Tag, AlignRight, Award, Search, Info,
  Globe, ChevronLeft, Shield, Store,
  TrendingUp, AlertCircle, CheckCircle2, Lightbulb,
  Hash, ArrowUpRight, Barcode, Type, Megaphone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCharacterCounter } from '../hooks/useCharacterCounter';
import { decodeUnicode } from '../utils/unicode';
import { normalizeArabicSeoTerms } from '../utils/arabicNormalizer';

/* ── Types ─────────────────────────────────────────── */
interface ParsedOutput {
  productName?: string;
  productDesc?: string;
  specs?: string;
  usps?: string;
  seoTitle?: string;
  metaDesc?: string;
  slug?: string;
  altText?: string;
  cta?: string;
}

interface ResultsViewProps {
  result: string;
  pk: string;
  productName: string;
  plagiarismResult: { score: number; details: string } | null;
  plagiarismLoading: boolean;
  checkPlagiarism: () => void;
  copyToClipboard: () => void;
  copied: boolean;
  setActiveTab: (tab: string) => void;
  seoTitle: string;
  metaDescription: string;
  generateMode?: 'default' | 'seo-check';
}

/* ── Helpers ────────────────────────────────────────── */

/** حذف كل رموز Markdown من نص عادي */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
    .replace(/\*(.*?)\*/g, '$1')        // italic
    .replace(/^#{1,6}\s+/gm, '')        // headings
    .replace(/^[-–—]{3,}$/gm, '')       // hr
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // code
    .replace(/^\s*[-•*]\s+/gm, '• ')   // bullets → •
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** تنظيف Slug من / و # و * في البداية والنهاية */
function cleanSlug(slug: string): string {
  return slug.replace(/^[/#*\s]+|[/#*\s]+$/g, '').trim();
}

function parseResult(raw: string): ParsedOutput {
  const labels = [
    'اسم المنتج:', 'اسم المنتج التسويقي:', 'عنوان السيو:', 'وصف الميتا:',
    'وصف المنتج:', 'نص المحتوى (وصف المنتج/مقال/وصف فئة):', 'المواصفات:',
    'النقاط الرئيسية/المواصفات:', 'نقاط التميز التنافسية:',
    'Slug URL (بالعربية):', 'نص Alt للصورة:', 'دعوة لاتخاذ إجراء (CTA):',
  ];
  const parsed: Record<string, string> = {};
  labels.forEach(label => {
    if (!raw.includes(label)) return;
    const start = raw.indexOf(label) + label.length;
    let end = raw.length;
    labels.forEach(next => {
      const idx = raw.indexOf(next, start);
      if (idx !== -1 && idx < end) end = idx;
    });
    let value = raw.substring(start, end).trim();
    while ((value.startsWith('**') && value.endsWith('**')) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.startsWith('**') ? value.slice(2, -2).trim() : value.slice(1, -1).trim();
    }
    parsed[label] = value;
  });
  return {
    productName: parsed['اسم المنتج:'] || parsed['اسم المنتج التسويقي:'],
    productDesc: parsed['وصف المنتج:'] || parsed['نص المحتوى (وصف المنتج/مقال/وصف فئة):'],
    specs: parsed['المواصفات:'] || parsed['النقاط الرئيسية/المواصفات:'],
    usps: parsed['نقاط التميز التنافسية:'],
    seoTitle: parsed['عنوان السيو:'],
    metaDesc: parsed['وصف الميتا:'],
    slug: parsed['Slug URL (بالعربية):'] ? cleanSlug(parsed['Slug URL (بالعربية):']) : undefined,
    altText: parsed['نص Alt للصورة:'],
    cta: parsed['دعوة لاتخاذ إجراء (CTA):'],
  };
}

function highlightKeywords(text: string, keywords: string[]): string {
  if (!text || !keywords.length) return text;
  let out = text;
  const sorted = [...keywords].filter(Boolean).map(k => k.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<!\\*\\*)(${esc})(?!\\*\\*)`, 'gi');
    out = out.replace(re, '**$1**');
  }
  return out;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/* ── SKU Generator ──────────────────────────────────── */

function generateSKU(productName: string): string {
  // 3 حروف من اسم المنتج (أولى 3 حروف عربية أو لاتينية)
  const letters = (productName || '')
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const prefix = letters.padEnd(3, 'X');

  // Generate random 5 digits
  const rand = Math.floor(10000 + Math.random() * 90000).toString();
  return `${prefix}-${rand}`;
}

/* ── SubTitle & Promo ───────────────────────────────── */
function deriveSubTitle(productName: string, metaDesc: string): string {
  // نأخذ أول جملة منطقية من وصف الميتا ونقصرها إلى 35 حرف
  const src = stripMarkdown(metaDesc || productName || '');
  const sentence = src.split(/[،.!؟]/)[0].trim();
  return sentence.length > 35 ? sentence.slice(0, 33) + '…' : sentence;
}

function derivePromoTitle(productName: string, cta: string): string {
  // نأخذ أول كلمتين-ثلاث من CTA أو نعيد بناء عبارة
  const src = stripMarkdown(cta || productName || '');
  const words = src.split(/\s+/).slice(0, 4).join(' ');
  const result = words.length > 25 ? words.slice(0, 23) + '…' : words;
  return result || 'عرض لا يفوتك!';
}

/* ── RichText renderer ──────────────────────────────── */
function RichText({ text, keywords }: { text: string; keywords: string[] }) {
  const highlighted = highlightKeywords(stripHtml(text), keywords);
  const lines = highlighted.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pr-5 space-y-1.5 my-3">{listItems}</ul>);
      listItems = [];
    }
  };

  const renderInline = (str: string): React.ReactNode[] =>
    str.split(/(\*\*[^*]+\*\*)/g).map((p, idx) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={idx} className="font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-1 py-0.5 rounded">{p.slice(2, -2)}</strong>
        : <span key={idx}>{p}</span>
    );

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); return; }
    const isBullet = /^[-•*]\s/.test(trimmed);
    if (isBullet) {
      listItems.push(<li key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{renderInline(trimmed.replace(/^[-•*]\s/, ''))}</li>);
    } else {
      flushList();
      const isHeading = /^#{1,3}\s/.test(trimmed);
      if (isHeading) {
        elements.push(<h4 key={i} className="font-black text-slate-800 dark:text-slate-100 text-sm mt-4 mb-2">{renderInline(trimmed.replace(/^#+\s*/, ''))}</h4>);
      } else {
        elements.push(<p key={i} className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-2">{renderInline(trimmed)}</p>);
      }
    }
  });
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

function SpecsList({ text, keywords }: { text: string; keywords: string[] }) {
  const highlighted = highlightKeywords(stripHtml(text), keywords);
  const lines = highlighted.split('\n').map(l => l.trim()).filter(Boolean);

  const renderInline = (str: string): React.ReactNode[] =>
    str.split(/(\*\*[^*]+\*\*)/g).map((p, idx) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={idx} className="font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-1 py-0.5 rounded">{p.slice(2, -2)}</strong>
        : <span key={idx}>{p}</span>
    );

  return (
    <div className="grid grid-cols-1 gap-2.5">
      {lines.map((line, i) => {
        const content = line.replace(/^[-•*]\s*/, '');
        const colonIdx = content.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
          const label = content.slice(0, colonIdx).replace(/\*\*/g, '');
          const value = content.slice(colonIdx + 1).trim();
          return (
            <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest sm:w-28 shrink-0 group-hover:text-emerald-600 transition-colors mt-0.5">{label}</span>
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{renderInline(value)}</div>
            </div>
          );
        }
        return (
          <div key={i} className="p-3 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-600 flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{renderInline(content)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── CopyBtn ────────────────────────────────────────── */
function CopyBtn({ text, label, size = 'md' }: { text: string; label: string; size?: 'sm' | 'md' }) {
  const [done, setDone] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(stripMarkdown(text));
      setDone(true);
      toast.success(`تم نسخ ${label}`);
      setTimeout(() => setDone(false), 2000);
    } catch { toast.error('فشل النسخ'); }
  }, [text, label]);
  return (
    <button onClick={handleCopy} className={`${size === 'sm' ? 'p-2' : 'p-2.5'} rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all active:scale-90 shadow-sm shrink-0`} title={`نسخ ${label}`}>
      <AnimatePresence mode="wait" initial={false}>
        {done
          ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /></motion.span>
          : <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /></motion.span>
        }
      </AnimatePresence>
    </button>
  );
}

/* ── Card components ────────────────────────────────── */
function Card({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ icon: Icon, title, color = 'emerald', copyText, copyLabel }: { icon: LucideIcon; title: string; color?: string; copyText?: string; copyLabel?: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    purple:  'bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400',
    amber:   'bg-amber-50  dark:bg-amber-900/20  text-amber-500  dark:text-amber-400',
    cyan:    'bg-cyan-50   dark:bg-cyan-900/20   text-cyan-500   dark:text-cyan-400',
    rose:    'bg-rose-50   dark:bg-rose-900/20   text-rose-500   dark:text-rose-400',
    slate:   'bg-slate-50  dark:bg-slate-700     text-slate-500  dark:text-slate-400',
  };
  return (
    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-50 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${colorMap[color] ?? colorMap.emerald}`}><Icon className="w-4 h-4" /></div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
      </div>
      {copyText && copyLabel && <CopyBtn text={copyText} label={copyLabel} />}
    </div>
  );
}

function GoogleSnippet({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-1.5 font-sans">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center"><Globe className="w-3 h-3 text-white" /></div>
        <span className="text-xs text-slate-500 font-medium">https://example.com › product</span>
        <ArrowUpRight className="w-3 h-3 text-slate-400 ml-auto" />
      </div>
      <p className="text-blue-700 text-sm font-medium leading-snug line-clamp-2 hover:underline cursor-pointer">{title || 'عنوان السيو سيظهر هنا…'}</p>
      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">{description || 'وصف الميتا سيظهر هنا…'}</p>
    </div>
  );
}

function buildRecommendations(p: ParsedOutput, pk: string): string[] {
  const recs: string[] = [];
  const titleLen = (p.seoTitle || '').length;
  const metaLen = (p.metaDesc || '').length;
  const pkList = pk.split(',').filter(k => k.trim());
  if (titleLen < 40) recs.push('عنوان السيو قصير — يُفضَّل بين 50 و60 حرفاً.');
  if (titleLen > 65) recs.push('عنوان السيو طويل — قلّصه دون 60 حرفاً.');
  if (titleLen >= 40 && titleLen <= 65) recs.push('✓ طول عنوان السيو ممتاز.');
  if (metaLen < 100) recs.push('وصف الميتا قصير — يُفضَّل بين 120 و155 حرفاً.');
  if (metaLen > 160) recs.push('وصف الميتا طويل — قلّصه دون 160 حرفاً.');
  if (metaLen >= 100 && metaLen <= 160) recs.push('✓ طول وصف الميتا جيد.');
  if (pkList.length < 3) recs.push('عدد الكلمات المفتاحية قليل — أضف المزيد.');
  if (pkList.length >= 3) recs.push('✓ تنوع جيد في الكلمات المفتاحية.');
  if (!p.slug) recs.push('Slug URL غير موجود.');
  if (!p.altText) recs.push('نص Alt للصورة مفقود.');
  if (!p.cta) recs.push('لا يوجد CTA.');
  if (!p.usps) recs.push('نقاط التميز التنافسية غائبة.');
  if (recs.length === 0) recs.push('✓ المحتوى مُحسَّن بشكل ممتاز!');
  return recs;
}

/* ── Main component ─────────────────────────────────── */
export default function ResultsView({
  result, pk, productName: rawProductName, plagiarismResult, plagiarismLoading,
  checkPlagiarism, copyToClipboard, copied, setActiveTab,
  seoTitle: externalSeoTitle, metaDescription: externalMetaDesc,
}: ResultsViewProps) {
  const parsed = parseResult(result);
  const keywords = pk.split(',').map(k => k.trim()).filter(Boolean);
  
  // Apply unicode decoding and arabic normalization
  const displayName     = normalizeArabicSeoTerms(decodeUnicode(parsed.productName || rawProductName));
  const displaySeoTitle = normalizeArabicSeoTerms(decodeUnicode(parsed.seoTitle    || externalSeoTitle));
  const displayMetaDesc = normalizeArabicSeoTerms(decodeUnicode(parsed.metaDesc    || externalMetaDesc));
  const recommendations = buildRecommendations(parsed, pk);

  const [localSeoTitle, setLocalSeoTitle] = useState<string | null>(null);
  const [localMetaDesc, setLocalMetaDesc] = useState<string | null>(null);
  const [isShorteningTitle, setIsShorteningTitle] = useState(false);
  const [isShorteningMeta, setIsShorteningMeta] = useState(false);

  const activeSeoTitle = localSeoTitle ?? displaySeoTitle ?? '';
  const activeMetaDesc = localMetaDesc ?? displayMetaDesc ?? '';

  const titleCounter = useCharacterCounter(stripMarkdown(activeSeoTitle), 0, 55);
  const metaCounter = useCharacterCounter(stripMarkdown(activeMetaDesc), 140, 155);

  const handleShortenTitle = async () => {
    setIsShorteningTitle(true);
    try {
      const { shortenSeoTitle } = await import('../lib/api');
      const shortened = await shortenSeoTitle(activeSeoTitle);
      setLocalSeoTitle(shortened);
      toast.success('تم تقليص العنوان بنجاح');
    } catch {
      toast.error('فشل تقصير العنوان');
    } finally {
      setIsShorteningTitle(false);
    }
  };

  const handleShortenMeta = async () => {
    setIsShorteningMeta(true);
    try {
      const { shortenMetaDescription } = await import('../lib/api');
      const shortened = await shortenMetaDescription(activeMetaDesc);
      setLocalMetaDesc(shortened);
      toast.success('تم تقصير الوصف بنجاح');
    } catch {
      toast.error('فشل تقصير الوصف');
    } finally {
      setIsShorteningMeta(false);
    }
  };

  // SKU — استمر ببناء نفس SKU لنفس المنتج ما لم يتغير الاسم
  const skuRef = useRef<string>('');
  useEffect(() => {
    if (displayName && !skuRef.current) {
      skuRef.current = generateSKU(displayName);
    }
  }, [displayName]);
  const sku = skuRef.current || (displayName ? generateSKU(displayName) : '');

  // عنوان فرعي وترويجي مشتق
  const subTitle   = deriveSubTitle(displayName || '', activeMetaDesc);
  const promoTitle = derivePromoTitle(displayName || '', parsed.cta || '');

  let score = 60;
  if ((activeSeoTitle  || '').length >= 40 && (activeSeoTitle  || '').length <= 65) score += 8;
  if ((activeMetaDesc  || '').length >= 100 && (activeMetaDesc || '').length <= 160) score += 8;
  if (parsed.slug)   score += 6;
  if (parsed.altText) score += 6;
  if (parsed.cta)    score += 6;
  if (parsed.usps)   score += 6;
  score = Math.min(score, 100);

  const scoreColor  = score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg     = score >= 85 ? 'bg-emerald-50'    : score >= 65 ? 'bg-amber-50'    : 'bg-rose-50';
  const scoreBorder = score >= 85 ? 'border-emerald-100': score >= 65 ? 'border-amber-100': 'border-rose-100';

  /* نسخ وصف + مواصفات بتنسيق HTML جاهز للمتجر */
  const copyDescAndSpecsForStore = useCallback(async () => {
    const kws = keywords;
    const colorize = (text: string): string => {
      let out = text;
      const sorted = [...kws].filter(Boolean).sort((a, b) => b.length - a.length);
      for (const kw of sorted) {
        const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(`(${esc})`, 'gi'),
          `<strong style="color:#dc2626;font-weight:700;">$1</strong>`);
      }
      return out;
    };
    const mdToHtml = (t: string) =>
      colorize(t.replace(/\*\*([^*]+)\*\*/g,
        `<strong style="color:#dc2626;font-weight:700;">$1</strong>`));

    const parts: string[] = [];
    if (displayName) parts.push(`<h2 style="font-size:1.3em;font-weight:800;color:#111;margin-bottom:10px;direction:rtl;">${stripMarkdown(displayName)}</h2>`);
    if (parsed.productDesc) {
      const lines = parsed.productDesc.split('\n').map(l => l.trim()).filter(Boolean);
      const html = lines.map(l => {
        if (/^[-•*]\s/.test(l)) return `<li style="margin-bottom:6px;">${mdToHtml(l.replace(/^[-•*]\s/, ''))}</li>`;
        if (/^#{1,3}\s/.test(l)) return `<strong style="font-weight:800;color:#111;">${mdToHtml(l.replace(/^#+\s*/, ''))}</strong><br/>`;
        return `<p style="margin:0 0 8px;line-height:1.8;color:#333;direction:rtl;">${mdToHtml(l)}</p>`;
      }).join('\n').replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g,
        m => `<ul style="padding-right:20px;margin:8px 0;">${m}</ul>`);
      parts.push(`<div style="direction:rtl;">${html}</div>`);
    }
    if (parsed.specs) {
      const specLines = parsed.specs.split('\n').map(l => l.trim()).filter(Boolean);
      const specsHtml = specLines.map(l => {
        const c = l.replace(/^[-•*]\s*/, '');
        const ci = c.indexOf(':');
        if (ci > 0 && ci < 20) {
          const lbl = c.slice(0, ci).replace(/\*\*/g, '');
          const val = c.slice(ci + 1).trim();
          return `<li style="margin-bottom:8px;line-height:1.7;color:#333;"><strong style="font-weight:700;color:#111;">${lbl}:</strong> ${mdToHtml(val)}</li>`;
        }
        return `<li style="margin-bottom:8px;color:#333;">${mdToHtml(c)}</li>`;
      }).join('\n');
      parts.push(`<div style="margin-top:14px;direction:rtl;"><strong style="font-size:1em;font-weight:800;color:#111;display:block;margin-bottom:8px;">المواصفات:</strong><ul style="padding-right:20px;margin:0;list-style:disc;">${specsHtml}</ul></div>`);
    }
    const htmlContent = `<div style="font-family:inherit;direction:rtl;text-align:right;">${parts.join('\n')}</div>`;
    const plainText = stripMarkdown([parsed.productDesc || '', parsed.specs ? `المواصفات:\n${parsed.specs}` : ''].join('\n\n'));
    try {
      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        })]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      toast.success('تم النسخ — الصقه مباشرة في المتجر 🎉');
    } catch {
      try { await navigator.clipboard.writeText(plainText); toast.success('تم النسخ كنص عادي'); }
      catch { toast.error('فشل النسخ'); }
    }
  }, [displayName, parsed.productDesc, parsed.specs, keywords]);

  return (
    <div className="space-y-5 pb-16" dir="rtl">

      {/* Top bar */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">نتائج تحليل السيو الذكي</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={checkPlagiarism} disabled={plagiarismLoading} className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 hover:text-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-50 active:scale-95">
            {plagiarismLoading ? <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Shield className="w-4 h-4" />}
            فحص الأصالة
          </button>
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-100 active:scale-95">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'تم النسخ' : 'نسخ الكل'}
          </button>
          <button onClick={() => setActiveTab('generate')} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
            العودة <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>

      {/* Notice + score */}
      <Card delay={0.02} className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-xl shrink-0"><Lightbulb className="w-4 h-4" /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">ملاحظة حول التحسين</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">الكلمات المفتاحية مُبرَّزة باللون الأحمر. تأكد من توزيعها بشكل طبيعي قبل النشر.</p>
          </div>
          <div className={`px-3 py-2 rounded-xl border ${scoreBg} ${scoreBorder} text-center shrink-0`}>
            <p className={`text-xl font-black ${scoreColor}`}>{score}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">سيو</p>
          </div>
        </div>
      </Card>

      {plagiarismResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm"><Shield className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">نتيجة فحص الأصالة</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{plagiarismResult.details}</p>
            </div>
          </div>
          <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{plagiarismResult.score}%</span>
        </motion.div>
      )}

      {/* 1. Product Name */}
      {displayName && (
        <Card delay={0.04} className="p-5">
          <CardHeader icon={Tag} title="اسم المنتج" color="emerald" copyText={displayName} copyLabel="اسم المنتج" />
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-snug">
            {stripMarkdown(displayName).length > 90 ? stripMarkdown(displayName).slice(0, 87) + '...' : stripMarkdown(displayName)}
          </p>
        </Card>
      )}

      {/* 2. Sub-title (NEW) */}
      <Card delay={0.05} className="p-5">
        <CardHeader icon={Type} title="العنوان الفرعي" color="cyan" copyText={subTitle} copyLabel="العنوان الفرعي" />
        <div className="flex items-start gap-3">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 flex-1">{subTitle}</p>
          <span className={`text-[10px] font-black px-2 py-1 rounded-full border shrink-0 ${subTitle.length <= 35 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{subTitle.length}/35</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">يظهر تحت اسم المنتج في المتجر • بحد أقصى 35 حرف</p>
      </Card>

      {/* 3. Promo title (NEW) */}
      <Card delay={0.055} className="p-5">
        <CardHeader icon={Megaphone} title="العنوان الترويجي" color="rose" copyText={promoTitle} copyLabel="العنوان الترويجي" />
        <div className="flex items-start gap-3">
          <p className="text-base font-bold text-slate-800 dark:text-slate-100 flex-1">{promoTitle}</p>
          <span className={`text-[10px] font-black px-2 py-1 rounded-full border shrink-0 ${promoTitle.length <= 25 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>{promoTitle.length}/25</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">يظهر على صورة المنتج في المتجر • بحد أقصى 25 حرف</p>
      </Card>

      {/* 4. Description + Specs */}
      {(parsed.productDesc || parsed.specs) && (
        <Card delay={0.06} className="p-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500"><AlignRight className="w-4 h-4" /></div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">وصف المنتج والمواصفات</h3>
            </div>
            <div className="flex items-center gap-2">
              <CopyBtn text={`${stripMarkdown(parsed.productDesc || '')}\n\nالمواصفات:\n${stripMarkdown(parsed.specs || '')}`} label="الوصف (نص)" size="sm" />
              <button onClick={copyDescAndSpecsForStore} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black rounded-xl transition-all active:scale-95 shadow-sm shadow-purple-200">
                <Store className="w-3.5 h-3.5" /> نسخ للمتجر
              </button>
            </div>
          </div>
          {parsed.productDesc && <div className="mb-4"><RichText text={parsed.productDesc} keywords={keywords} /></div>}
          {parsed.specs && (
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />المواصفات الفنية</h4>
              <SpecsList text={parsed.specs} keywords={keywords} />
            </div>
          )}
        </Card>
      )}

      {/* 5. USPs */}
      {parsed.usps && (
        <Card delay={0.08} className="p-5">
          <CardHeader icon={Award} title="نقاط التميز التنافسية (USPs)" color="amber" copyText={stripMarkdown(parsed.usps)} copyLabel="نقاط التميز" />
          <RichText text={parsed.usps} keywords={keywords} />
        </Card>
      )}

      {/* 6. SEO Title */}
      {activeSeoTitle && (
        <Card delay={0.10} className="p-5">
          <CardHeader icon={Search} title="عنوان السيو (SEO Title)" color="emerald" copyText={stripMarkdown(activeSeoTitle)} copyLabel="عنوان السيو" />
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <p className="text-lg font-black text-slate-900 dark:text-white leading-snug flex-1">{stripMarkdown(activeSeoTitle)}</p>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${titleCounter.isTooLong ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {titleCounter.length} حرف
              </span>
              {titleCounter.isTooLong && (
                <button onClick={handleShortenTitle} disabled={isShorteningTitle} className="flex items-center gap-1 px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50">
                  {isShorteningTitle ? 'جاري التقليص...' : '✂️ تقليص تلقائي'}
                </button>
              )}
            </div>
          </div>
          {titleCounter.isTooLong && (
            <p className="text-[10px] text-rose-500 mt-2 font-bold">⚠️ العنوان أطول من 55 حرفاً، قد يتم اقتطاعه في نتائج البحث.</p>
          )}
        </Card>
      )}

      {/* 7. Meta Description */}
      {activeMetaDesc && (
        <Card delay={0.12} className="p-5">
          <CardHeader icon={Info} title="وصف الميتا (Meta Description)" color="cyan" copyText={stripMarkdown(activeMetaDesc)} copyLabel="وصف الميتا" />
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">{stripMarkdown(activeMetaDesc)}</p>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${!metaCounter.isWithinRange ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {metaCounter.length} حرف
              </span>
              {!metaCounter.isWithinRange && (
                <button onClick={handleShortenMeta} disabled={isShorteningMeta} className="flex items-center gap-1 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50">
                  {isShorteningMeta ? 'جاري التقصير...' : '✂️ تقصير ذكي'}
                </button>
              )}
            </div>
          </div>
          {!metaCounter.isWithinRange && (
            <p className="text-[10px] text-amber-600 mt-2 font-bold">
              {metaCounter.isTooShort ? '⚠️ الوصف قصير جداً، يُفضل أن يكون بين 140 و 155 حرفاً.' : '⚠️ الوصف طويل جداً، يُفضل أن يكون بين 140 و 155 حرفاً.'}
            </p>
          )}
        </Card>
      )}

      {/* 8. SKU (NEW) */}
      {displayName && (
        <Card delay={0.13} className="p-5">
          <CardHeader icon={Barcode} title="الرمز التخزيني (SKU)" color="slate" copyText={sku} copyLabel="SKU" />
          <div className="flex items-center gap-4">
            <p className="text-2xl font-black tracking-widest text-slate-900 dark:text-white font-mono">{sku}</p>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg">فريد وغير مكرر</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">3 حروف من اسم المنتج + 5 أرقام عشوائية فريدة</p>
        </Card>
      )}

      {/* 9. Google Preview + Slug + Alt + CTA */}
      <Card delay={0.14} className="p-5">
        <CardHeader icon={Globe} title="عناصر تحسين محركات البحث" color="emerald" />
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">معاينة جوجل</p>
          <GoogleSnippet title={activeSeoTitle} description={activeMetaDesc} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {parsed.slug && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-600">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug URL</span>
                <CopyBtn text={cleanSlug(parsed.slug)} label="Slug" size="sm" />
              </div>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 break-all leading-relaxed">{cleanSlug(parsed.slug)}</p>
            </div>
          )}
          {parsed.altText && (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-100 dark:border-slate-600">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نص Alt</span>
                <CopyBtn text={stripMarkdown(parsed.altText)} label="نص Alt" size="sm" />
              </div>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-relaxed">{stripMarkdown(parsed.altText)}</p>
            </div>
          )}
          {parsed.cta && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">CTA</span>
                <CopyBtn text={stripMarkdown(parsed.cta)} label="CTA" size="sm" />
              </div>
              <p className="text-xs font-black text-emerald-800 dark:text-emerald-200 leading-relaxed">{stripMarkdown(parsed.cta)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* 10. Keywords */}
      {keywords.length > 0 && (
        <Card delay={0.16} className="p-5">
          <CardHeader icon={Hash} title="الكلمات المفتاحية الأساسية (PKs)" color="emerald" />
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.16 + i * 0.03 }} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-xl hover:bg-emerald-100 transition-colors">{kw}</motion.span>
            ))}
          </div>
        </Card>
      )}

      {/* 11. Recommendations */}
      <Card delay={0.20} className="p-5">
        <CardHeader icon={TrendingUp} title="توصيات السيو" color="rose" />
        <div className="space-y-2.5">
          {recommendations.map((rec, i) => {
            const isPositive = rec.startsWith('✓');
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 + i * 0.04 }}
                className={`flex items-start gap-3 p-3 rounded-xl ${isPositive ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-600'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPositive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                  {isPositive ? <Check className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                </div>
                <p className={`text-xs font-bold leading-relaxed ${isPositive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>{isPositive ? rec.replace('✓ ', '') : rec}</p>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'طول العنوان',    value: `${(activeSeoTitle || '').length}`, unit: 'حرف', ok: !titleCounter.isTooLong },
          { label: 'طول الميتا',     value: `${(activeMetaDesc || '').length}`, unit: 'حرف', ok: metaCounter.isWithinRange },
          { label: 'كلمات أساسية',   value: `${keywords.length}`,                unit: 'كلمة', ok: keywords.length >= 3 },
          { label: 'نقاط السيو',     value: `${score}`,                          unit: '/100', ok: score >= 70 },
        ].map((s, i) => (
          <div key={i} className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 text-center shadow-sm ${s.ok ? 'border-emerald-100 dark:border-emerald-800' : 'border-amber-100 dark:border-amber-800'}`}>
            <p className={`text-2xl font-black ${s.ok ? 'text-emerald-600' : 'text-amber-500'}`}>{s.value}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.unit}</p>
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
