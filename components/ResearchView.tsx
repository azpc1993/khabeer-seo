'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Globe, 
  Loader2, 
  Sparkles, 
  Plus, 
  Check, 
  History, 
  AlertCircle 
} from 'lucide-react';
import { CrystalCard, AppTextField, PrimaryButton } from './EliteUI';
import { Tooltip } from './Common';

interface ResearchResults {
  primaryKeywords: {
    keyword: string;
    volume: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    trend: number[];
  }[];
  lsiKeywords: {
    keyword: string;
    relevance: number;
    competition: 'Low' | 'Medium' | 'High';
  }[];
  questions: string[];
  topics: string[];
}

interface ResearchViewProps {
  researchQuery: string;
  setResearchQuery: (val: string) => void;
  researchRegion: string;
  setResearchRegion: (val: string) => void;
  performKeywordResearch: () => void;
  researchLoading: boolean;
  researchResults: ResearchResults | null;
  addKeywordFromResearch: (keyword: string, type: 'pk' | 'lsi') => void;
  pk: string;
  lsi: string;
}

const ResearchView: React.FC<ResearchViewProps> = ({
  researchQuery,
  setResearchQuery,
  researchRegion,
  setResearchRegion,
  performKeywordResearch,
  researchLoading,
  researchResults,
  addKeywordFromResearch,
  pk,
  lsi
}) => {
  return (
    <motion.div
      key="research"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-500/20">
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">بحث الكلمات المفتاحية الذكي</h2>
            <p className="text-sm font-bold text-slate-400 mt-1">اكتشف الكلمات التي يبحث عنها عملاؤك بالفعل</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="researchQuery" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">اسم المنتج أو الخدمة</label>
            <AppTextField
              id="researchQuery"
              value={researchQuery}
              onChange={(e) => setResearchQuery(e.target.value)}
              placeholder="مثال: قهوة مختصة"
              icon={Search}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="researchRegion" className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">المنطقة المستهدفة</label>
            <AppTextField
              id="researchRegion"
              value={researchRegion}
              onChange={(e) => setResearchRegion(e.target.value)}
              placeholder="مثال: السعودية، مصر، الخليج"
              icon={Globe}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <PrimaryButton
            onClick={performKeywordResearch}
            loading={researchLoading}
            className="px-8 py-4 text-sm"
          >
            <div className="flex items-center gap-2">
              {researchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span>بدء البحث والتحليل</span>
            </div>
          </PrimaryButton>
        </div>
      </section>

      {researchResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CrystalCard className="p-8 border-indigo-100 bg-indigo-50/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                الكلمات الأساسية المقترحة (PK)
              </h3>
              <Tooltip text="الكلمات التي يجب أن تظهر في العنوان والفقرة الأولى">
                <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-3">
              {researchResults.primaryKeywords.map((item: { keyword: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <span className="text-sm font-bold text-slate-700">{item.keyword}</span>
                  <button
                    onClick={() => addKeywordFromResearch(item.keyword, 'pk')}
                    disabled={pk.includes(item.keyword)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 disabled:bg-emerald-50 disabled:text-emerald-600 group-hover:scale-110"
                  >
                    {pk.includes(item.keyword) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </CrystalCard>

          <CrystalCard className="p-8 border-emerald-100 bg-emerald-50/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" />
                الكلمات الثانوية المقترحة (LSI)
              </h3>
              <Tooltip text="كلمات مرتبطة تساعد في تحسين سياق المحتوى">
                <AlertCircle className="w-4 h-4 text-slate-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="space-y-3">
              {researchResults.lsiKeywords.map((item: { keyword: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <span className="text-sm font-bold text-slate-700">{item.keyword}</span>
                  <button
                    onClick={() => addKeywordFromResearch(item.keyword, 'lsi')}
                    disabled={lsi.includes(item.keyword)}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50 disabled:bg-emerald-50 disabled:text-emerald-600 group-hover:scale-110"
                  >
                    {lsi.includes(item.keyword) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </CrystalCard>
        </div>
      )}
    </motion.div>
  );
};

export default ResearchView;
