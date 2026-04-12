'use client';

import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, Package, BookOpen, Layers, Star, ShieldCheck,
  Globe, Trash2, ChevronUp, ChevronDown, Search,
  BarChart3, Hash, Users, MessageSquare, Type, Layout,
  Wand2, Loader2, Plus,
} from 'lucide-react';
import { Icon } from '@/components/Common';
import { SoftSolidCard, PrimaryButton, ModernField } from '@/components/EliteUI';
import type { DashboardConfig } from '@/lib/constants';

import { FeatureGuard } from '@/components/subscription/FeatureGuard';

const ResultsView = lazy(() => import('@/components/ResultsView'));

export interface GenerateViewProps {
  contentType: 'product' | 'blog' | 'category';
  setContentType: (type: 'product' | 'blog' | 'category') => void;
  productName: string; setProductName: (v: string) => void;
  catchyTitle: string; setCatchyTitle: (v: string) => void;
  pk: string; setPk: (v: string) => void;
  manualPk: string; setManualPk: (v: string) => void;
  showManualPkInput: boolean; setShowManualPkInput: (v: boolean) => void;
  dashboardConfig: DashboardConfig;
  setDashboardConfig: (config: React.SetStateAction<DashboardConfig>) => void;
  progress: number;
  saveToHistory: (content: string) => void;
  isSaving: boolean; error: string;
  checkPlagiarism: () => void;
  plagiarismLoading: boolean;
  plagiarismResult: { score: number; details: string } | null;
  copyToClipboard: () => void; copied: boolean;
  renderStructuredOutput: () => React.ReactNode;
  copySummary: () => void; summaryCopied: boolean;
  lsi: string; setLsi: (v: string) => void;
  targetAudience: string; setTargetAudience: (v: string) => void;
  toneOfVoice: string; setToneOfVoice: (v: string) => void;
  metaLength: string; setMetaLength: (v: string) => void;
  keywordCount: string; setKeywordCount: (v: string) => void;
  specsFormat: string; setSpecsFormat: (v: string) => void;
  competitionLevel: string; setCompetitionLevel: (v: string) => void;
  correctionMode: 'auto' | 'suggest' | 'off'; setCorrectionMode: (v: 'auto' | 'suggest' | 'off') => void;
  variations: string; setVariations: (v: string) => void;
  sidebarVisibility: Record<string, boolean>;
  smartProductNameLoading: boolean; suggestSmartProductName: () => void;
  smartSuggestLoading: boolean; suggestSmartKeywords: () => void;
  suggestPKKeywords: () => void;
  suggestingLSI: boolean; suggestLSIKeywords: () => void;
  suggestedPKs: string[];
  suggestedLSIs: string[];
  competitorInfo: string; setCompetitorInfo: (v: string) => void;
  competitorUrl: string; setCompetitorUrl: (v: string) => void;
  loading: boolean; generateSEO: () => void; clearInputs: () => void;
  result: string;
  variationsRef: React.RefObject<HTMLTextAreaElement | null>;
  goToTab: (tab: string) => void;
}

function SmartBtn({ label, onClick, loading, icon: BtnIcon }: { label: string; onClick: () => void; loading?: boolean; icon?: React.ElementType }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-[11px] font-black rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 disabled:opacity-50 active:scale-95 whitespace-nowrap shadow-sm shadow-emerald-500/5 group"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : BtnIcon ? (
        <BtnIcon size={14} className="group-hover:rotate-12 transition-transform" />
      ) : (
        <Wand2 size={14} className="group-hover:rotate-12 transition-transform" />
      )}
      <span className="tracking-tight">{label}</span>
    </button>
  );
}

export default function GenerateView({
  contentType, setContentType,
  productName, setProductName,
  catchyTitle, setCatchyTitle,
  pk, setPk, lsi, setLsi,
  targetAudience, setTargetAudience,
  toneOfVoice, setToneOfVoice,
  metaLength, setMetaLength,
  keywordCount, setKeywordCount,
  specsFormat, setSpecsFormat,
  competitionLevel, setCompetitionLevel,
  correctionMode, setCorrectionMode,
  competitorInfo, setCompetitorInfo,
  competitorUrl, setCompetitorUrl,
  loading, generateSEO, clearInputs, result,
  smartProductNameLoading, suggestSmartProductName,
  suggestPKKeywords,
  suggestedPKs,
  suggestedLSIs,
  suggestingLSI,
  suggestLSIKeywords,
  checkPlagiarism, plagiarismLoading, plagiarismResult,
  copyToClipboard, copied,
  goToTab,
}: GenerateViewProps) {
  const [isCompetitorOpen, setIsCompetitorOpen] = useState(false);
  const [isSettingsOpen,   setIsSettingsOpen]   = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Input section ─────────────────────────── */}
      <motion.section
        key="generate-inputs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-5"
      >
        {/* Content type selector */}
        <SoftSolidCard className="p-3">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-2xl">
            {(['product', 'blog', 'category'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`px-3 py-2.5 rounded-xl text-xs font-black transition-all ${contentType === type ? 'bg-white dark:bg-slate-600 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
              >
                {type === 'product' ? 'وصف منتج' : type === 'blog' ? 'منشور مدونة' : 'وصف فئة'}
              </button>
            ))}
          </div>
        </SoftSolidCard>

        {/* Main Info Card */}
        <SoftSolidCard className="space-y-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Icon icon={contentType === 'product' ? Package : contentType === 'blog' ? BookOpen : Layers} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {contentType === 'product' ? 'المعلومات الأساسية للمنتج' : contentType === 'blog' ? 'معلومات المقال' : 'معلومات الفئة'}
          </h3>

          {/* Product name / URL + smart button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {contentType === 'product' ? 'اسم المنتج *' : contentType === 'blog' ? 'عنوان المقال *' : 'اسم الفئة *'}
              </label>
              <SmartBtn
                label="تحسين العنوان ذكياً"
                onClick={suggestSmartProductName}
                loading={smartProductNameLoading}
              />
            </div>
            <div className="relative">
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder={contentType === 'product' ? 'مثال: ساعة آبل الجيل الثامن' : 'مثال: 10 نصائح لتحسين السيو'}
                className="app-input w-full border rounded-2xl px-5 py-4 outline-none transition-all text-right font-bold placeholder:opacity-50 text-base"
                dir="rtl"
              />
              <Icon icon={Package} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 transition-colors w-5 h-5" />
            </div>
          </div>

          <ModernField
            label={contentType === 'product' ? 'العنوان الجذاب' : contentType === 'blog' ? 'العنوان الفرعي' : 'وصف قصير'}
            value={catchyTitle}
            onChange={(e) => setCatchyTitle(e.target.value)}
            placeholder={contentType === 'product' ? 'مثال: تجربة لا مثيل لها' : 'مثال: دليلك الشامل'}
            icon={Star}
          />
        </SoftSolidCard>

          {/* Keywords Card */}
          <SoftSolidCard className="space-y-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              الكلمات المفتاحية المتقدمة
            </h3>
  
            {/* PK field + smart button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  الكلمات المفتاحية الأساسية (PKs) *
                </label>
                <SmartBtn
                  label="توليد ذكي للكلمات"
                  onClick={suggestPKKeywords}
                  icon={Sparkles}
                />
              </div>
              <div className="relative">
                <input
                  value={pk}
                  onChange={(e) => setPk(e.target.value)}
                  placeholder="أضف الكلمات المفتاحية الأساسية..."
                  className="app-input w-full border rounded-2xl px-5 py-4 outline-none transition-all text-right font-bold placeholder:opacity-50 text-base"
                />
                <Hash size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" />
              </div>
              
              {/* Suggested PKs Chips */}
              {suggestedPKs.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedPKs.map((keyword, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newPk = pk ? `${pk}, ${keyword}` : keyword;
                        setPk(newPk);
                        toast.success(`تمت إضافة: ${keyword}`);
                      }}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-xl border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={10} />
                      {keyword}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
  
            {/* LSI field + smart button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  الكلمات الثانوية (LSI)
                </label>
                <SmartBtn
                  label="اقتراح LSI"
                  onClick={suggestLSIKeywords}
                  loading={suggestingLSI}
                  icon={Layers}
                />
              </div>
              <div className="relative">
                <input
                  value={lsi}
                  onChange={(e) => setLsi(e.target.value)}
                  placeholder="أضف الكلمات الثانوية..."
                  className="app-input w-full border rounded-2xl px-5 py-4 outline-none transition-all text-right font-bold placeholder:opacity-50 text-base"
                />
                <Layers size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" />
              </div>

              {/* Suggested LSIs Chips */}
              {suggestedLSIs.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedLSIs.map((keyword, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const newLsi = lsi ? `${lsi}, ${keyword}` : keyword;
                        setLsi(newLsi);
                        toast.success(`تمت إضافة: ${keyword}`);
                      }}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-black rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={10} />
                      {keyword}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </SoftSolidCard>

        {/* Competitor Analysis */}
        <SoftSolidCard className="space-y-4">
            <button onClick={() => setIsCompetitorOpen(!isCompetitorOpen)} className="w-full flex items-center justify-between text-sm font-black text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> تحليل المنافسين (اختياري)</span>
              {isCompetitorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {isCompetitorOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                  <ModernField label="رابط منتج المنافس" value={competitorUrl} onChange={(e) => setCompetitorUrl(e.target.value)} placeholder="https://..." icon={Globe} />
                  <ModernField label="معلومات إضافية" value={competitorInfo} onChange={(e) => setCompetitorInfo(e.target.value)} placeholder="معلومات..." icon={BarChart3} />
                </motion.div>
              )}
            </AnimatePresence>
          </SoftSolidCard>

          {/* Format Settings */}
          <SoftSolidCard className="space-y-4">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-full flex items-center justify-between text-sm font-black text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> إعدادات التنسيق والجمهور (اختياري)</span>
              {isSettingsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                  <ModernField label="الجمهور المستهدف" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="مثال: الشباب" icon={Users} />
                  <ModernField label="نبرة الصوت" value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} placeholder="احترافي" icon={MessageSquare} />
                  <ModernField label="طول الميتا" value={metaLength} onChange={(e) => setMetaLength(e.target.value)} placeholder="متوسط" icon={Type} />
                  <ModernField label="عدد الكلمات" value={keywordCount} onChange={(e) => setKeywordCount(e.target.value)} placeholder="10-15" icon={Hash} />
                  <ModernField label="تنسيق المواصفات" value={specsFormat} onChange={(e) => setSpecsFormat(e.target.value)} placeholder="نقاط" icon={Layout} />
                  <ModernField label="مستوى المنافسة" value={competitionLevel} onChange={(e) => setCompetitionLevel(e.target.value)} placeholder="متوسط" icon={BarChart3} />
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">وضع التصحيح</label>
                    <select value={correctionMode} onChange={(e) => setCorrectionMode(e.target.value as 'auto' | 'suggest' | 'off')} className="w-full px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 dark:text-white">
                      <option value="auto">تلقائي</option>
                      <option value="suggest">اقتراح</option>
                      <option value="off">إيقاف</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SoftSolidCard>

        {/* Generate Button */}
        <FeatureGuard 
          featureKey="generations" 
          featureName="توليد المحتوى"
          onUpgradeClick={() => goToTab('pricing')}
        >
          <PrimaryButton onClick={generateSEO} loading={loading} icon={Wand2} label={loading ? 'جاري التوليد...' : 'توليد المحتوى الآن'} className="py-5 text-base" />
        </FeatureGuard>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={clearInputs} className="py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95">
            <Trash2 className="w-4 h-4" /> مسح المدخلات
          </button>
          <button className="py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-default">
            حفظ في السجل ✔
          </button>
        </div>
      </motion.section>

      {/* ── Inline Results section ─────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.section
            key="inline-results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl mx-auto"
          >
            {/* divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                نتائج التوليد
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            </div>

            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>}>
              <ResultsView
                result={result}
                pk={pk}
                productName={productName}
                plagiarismResult={plagiarismResult}
                plagiarismLoading={plagiarismLoading}
                checkPlagiarism={checkPlagiarism}
                copyToClipboard={copyToClipboard}
                copied={copied}
                setActiveTab={() => {}}
                seoTitle={catchyTitle}
                metaDescription=""
              />
            </Suspense>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
