'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Plus,
  Network,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import { toast } from 'sonner'
import { FeatureGuard } from '@/components/subscription/FeatureGuard'
import { ResearchResults } from '@/types'

export interface ResearchViewProps {
  researchQuery: string
  setResearchQuery: (query: string) => void
  researchRegion: string
  setResearchRegion: (region: string) => void
  researchLoading: boolean
  researchResults: ResearchResults | null
  performKeywordResearch: () => void
  pk: string
  setPk: (pk: string) => void
  lsi: string
  setLsi: (lsi: string) => void
  suggestedPKs: string[]
  suggestedLSIs: string[]
  suggestKeywordsForResearch: () => void
  smartSuggestLoading: boolean
  goToTab: (tab: string) => void
}

function CopyKwBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      toast.success(`تم نسخ: ${text}`)
      setTimeout(() => setDone(false), 1800)
    } catch { toast.error('فشل النسخ') }
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      title="نسخ"
    >
      {done ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  )
}

function TrendIcon({ trend }: { trend?: string }) {
  const t = (trend || '').toLowerCase()
  if (t === 'growing')  return <TrendingUp  size={12} className="text-emerald-500" />
  if (t === 'declining')return <TrendingDown size={12} className="text-rose-500" />
  return <Minus size={12} className="text-slate-400" />
}

function difficultyColor(d?: string) {
  if (!d) return 'text-slate-500'
  if (d === 'Easy')   return 'text-emerald-600 dark:text-emerald-400'
  if (d === 'Medium') return 'text-amber-600'
  return 'text-rose-600'
}

function difficultyLabel(d?: string) {
  if (d === 'Easy')   return 'سهل'
  if (d === 'Medium') return 'متوسط'
  if (d === 'Hard')   return 'صعب'
  return d || '-'
}

function trendLabel(t?: string) {
  if (!t) return '-'
  const m: Record<string, string> = { Growing: 'صاعد ↑', Stable: 'مستقر', Declining: 'هابط ↓' }
  return m[t] || t
}

const ResearchView: React.FC<ResearchViewProps> = ({
  researchQuery, setResearchQuery,
  researchRegion, setResearchRegion,
  researchLoading, researchResults,
  performKeywordResearch,
  pk, setPk, lsi, setLsi,
  suggestedPKs, suggestedLSIs,
  suggestKeywordsForResearch,
  smartSuggestLoading,
  goToTab,
}) => {
  if (!researchResults) {
    return (
      <motion.div
        key="research-empty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">أداة البحث عن الكلمات المفتاحية</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">أدخل اسم المنتج للحصول على اقتراحات ذكية للكلمات الأساسية والثانوية.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              placeholder="أدخل اسم المنتج أو مجال البحث..."
              className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 outline-none transition-all text-sm text-slate-800 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && performKeywordResearch()}
            />
            <select
              value={researchRegion}
              onChange={(e) => setResearchRegion(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 dark:text-white text-sm"
            >
              <option value="السعودية">🇸🇦 السعودية</option>
              <option value="الإمارات">🇦🇪 الإمارات</option>
              <option value="مصر">🇪🇬 مصر</option>
              <option value="الكويت">🇰🇼 الكويت</option>
              <option value="قطر">🇶🇦 قطر</option>
              <option value="الأردن">🇯🇴 الأردن</option>
              <option value="المغرب">🇲🇦 المغرب</option>
              <option value="عالمي">🌍 عالمي</option>
            </select>
            <FeatureGuard 
              featureKey="keywordResearch" 
              featureName="البحث عن الكلمات"
              onUpgradeClick={() => goToTab('pricing')}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={performKeywordResearch}
                disabled={researchLoading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-3 whitespace-nowrap group"
              >
                {researchLoading
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : <Search className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                <span className="text-lg">بحث ذكي</span>
              </motion.button>
            </FeatureGuard>
            <FeatureGuard 
              featureKey="keywordInsights" 
              featureName="اقتراح الكلمات"
              onUpgradeClick={() => goToTab('pricing')}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={suggestKeywordsForResearch}
                disabled={smartSuggestLoading}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-100 dark:shadow-none transition-all flex items-center justify-center gap-3 whitespace-nowrap group"
              >
                {smartSuggestLoading
                  ? <Loader2 className="w-6 h-6 animate-spin" />
                  : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                <span className="text-lg">اقتراح كلمات</span>
              </motion.button>
            </FeatureGuard>
          </div>
          {(suggestedPKs.length > 0 || suggestedLSIs.length > 0) && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">اقتراحات الذكاء الاصطناعي:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedPKs.map((kw, i) => (
                  <button key={`pk-${i}`} onClick={() => {
                    const newPk = pk ? `${pk}, ${kw}` : kw;
                    setPk(newPk);
                    toast.success(`تمت إضافة: ${kw}`);
                  }} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors">
                    {kw}
                  </button>
                ))}
                {suggestedLSIs.map((kw, i) => (
                  <button key={`lsi-${i}`} onClick={() => {
                    const newLsi = lsi ? `${lsi}, ${kw}` : kw;
                    setLsi(newLsi);
                    toast.success(`تمت إضافة: ${kw}`);
                  }} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors">
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="research-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Search header (repeated for results view) */}
      <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={researchQuery}
            onChange={(e) => setResearchQuery(e.target.value)}
            placeholder="أدخل اسم المنتج أو مجال البحث..."
            className="flex-1 px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 focus:border-emerald-500 outline-none transition-all text-sm text-slate-800 dark:text-white"
            onKeyDown={(e) => e.key === 'Enter' && performKeywordResearch()}
          />
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={performKeywordResearch}
            disabled={researchLoading}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-400 text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-100 dark:shadow-none transition-all flex items-center justify-center gap-3 whitespace-nowrap group"
          >
            {researchLoading
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <Search className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
            <span className="text-lg">تحديث البحث</span>
          </motion.button>
        </div>
      </section>

      <div className="space-y-6">
        {/* Quick Add Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">إضافة سريعة للاقتراحات</h3>
          </div>
          
          <div className="space-y-4">
            {/* PK Quick Add */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الكلمات الأساسية المقترحة</p>
              <div className="flex flex-wrap gap-2">
                {researchResults.primaryKeywords?.slice(0, 5).map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const newPk = pk ? `${pk}, ${item.keyword}` : item.keyword;
                      setPk(newPk);
                      toast.success(`تمت إضافة: ${item.keyword}`);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-black rounded-xl border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={12} />
                    {item.keyword}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* LSI Quick Add */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الكلمات الثانوية المقترحة</p>
              <div className="flex flex-wrap gap-2">
                {researchResults.secondaryKeywords?.slice(0, 8).map((item, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const newLsi = lsi ? `${lsi}, ${item.keyword}` : item.keyword;
                      setLsi(newLsi);
                      toast.success(`تمت إضافة: ${item.keyword}`);
                    }}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[11px] font-black rounded-xl border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={12} />
                    {item.keyword}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Primary Keywords */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              </div>
              الكلمات المفتاحية الأساسية (PKs)
            </h3>

            <div className="space-y-3">
              {researchResults.primaryKeywords?.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-700 transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{item.keyword}</span>
                    <div className="flex items-center gap-1">
                      <CopyKwBtn text={item.keyword} />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          const newPk = pk ? `${pk}, ${item.keyword}` : item.keyword
                          setPk(newPk)
                          toast.success(`تمت إضافة: ${item.keyword}`)
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="إضافة إلى الكلمات الأساسية"
                      >
                        <Plus size={12} />
                        إضافة
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600 text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5 font-bold">مرات الظهور</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{item.volume?.toLocaleString('ar-SA') || '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600 text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5 font-bold">الصعوبة</p>
                      <p className={`text-xs font-bold ${difficultyColor(item.difficulty)}`}>{difficultyLabel(item.difficulty)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600 text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5 font-bold">سعر النقرة</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{item.cpc ? `${item.cpc} ر.س` : '-'}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-600 text-center">
                      <p className="text-[9px] text-slate-400 mb-0.5 font-bold">الاتجاه</p>
                      <div className="flex items-center justify-center gap-0.5">
                        <TrendIcon trend={item.trend} />
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{trendLabel(item.trend)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Network className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </div>
                الكلمات الثانوية (LSI)
              </h3>
              <div className="space-y-2">
                {researchResults.secondaryKeywords?.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-700 transition-all group"
                  >
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1 ml-2">{item.keyword}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <CopyKwBtn text={item.keyword} />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          const newLsi = lsi ? `${lsi}, ${item.keyword}` : item.keyword
                          setLsi(newLsi)
                          toast.success(`تمت إضافة: ${item.keyword}`)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="إضافة إلى LSI"
                      >
                        <Plus size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {researchResults.searchIntent && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
              >
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  تحليل نية البحث
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">النية الرئيسية</p>
                    <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed font-medium">{researchResults.searchIntent.intent}</p>
                  </div>
                  <div className="h-px w-full bg-emerald-200/50 dark:bg-emerald-800/50"></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">الجمهور المستهدف</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{researchResults.searchIntent.audience}</p>
                  </div>
                  <div className="h-px w-full bg-emerald-200/50 dark:bg-emerald-800/50"></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">استراتيجية المحتوى</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{researchResults.searchIntent.strategy}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ResearchView;
