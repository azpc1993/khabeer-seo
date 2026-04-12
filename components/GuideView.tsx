'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Zap, 
  Search, 
  Target, 
  History, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2 
} from 'lucide-react';
import { CrystalCard } from './EliteUI';

interface GuideViewProps {
  setActiveTab: (tab: string) => void;
}

const GuideView: React.FC<GuideViewProps> = ({ setActiveTab }) => {
  const steps = [
    {
      title: 'توليد المحتوى',
      desc: 'أدخل اسم المنتج والكلمات المفتاحية، وسيقوم كريستال بتوليد وصف سيو احترافي يتضمن العناوين والميتا والمواصفات.',
      icon: Zap,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      tab: 'generate'
    },
    {
      title: 'بحث الكلمات',
      desc: 'استخدم أداة البحث لاكتشاف الكلمات المفتاحية الأكثر بحثاً في منطقتك المستهدفة وإضافتها مباشرة لمشروعك.',
      icon: Search,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      tab: 'research'
    },
    {
      title: 'تتبع الترتيب',
      desc: 'أضف روابط منتجاتك وكلماتها المستهدفة لمراقبة تقدمك في نتائج البحث وتحديث ترتيبك يدوياً.',
      icon: Target,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      tab: 'product'
    },
    {
      title: 'إدارة السجل',
      desc: 'كل ما تولده يتم حفظه تلقائياً. يمكنك العودة لأي محتوى سابق، نسخه، أو إعادة استخدامه في أي وقت.',
      icon: History,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      tab: 'history'
    }
  ];

  return (
    <motion.div
      key="guide"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <section className="text-center space-y-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 mb-6">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">دليل استخدام كريستال سيو</h2>
        <p className="text-lg font-bold text-slate-400 max-w-2xl mx-auto">
          تعرف على كيفية استغلال كافة مميزات المنصة لتصدر نتائج البحث وزيادة مبيعاتك.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <CrystalCard 
            key={i} 
            onClick={() => setActiveTab(step.tab)}
            className="p-8 group hover:border-indigo-200 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-6">
              <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <step.icon className={`w-7 h-7 ${step.color}`} />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-xl font-black text-slate-900 flex items-center justify-between">
                  {step.title}
                  <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all" />
                </h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          </CrystalCard>
        ))}
      </div>

      <CrystalCard className="p-10 bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-right">
            <h3 className="text-2xl font-black flex items-center gap-3 justify-center md:justify-start">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              نصيحة ذهبية للسيو
            </h3>
            <p className="text-lg font-medium text-slate-300 max-w-xl leading-relaxed">
              دائماً اجعل الكلمة المفتاحية الأساسية (PK) تظهر في أول 100 كلمة من وصف المنتج، واستخدم الكلمات الثانوية (LSI) بشكل طبيعي في الفقرات التالية.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black uppercase tracking-widest">مفعل تلقائياً في كريستال</span>
          </div>
        </div>
      </CrystalCard>

      <div className="text-center pt-8">
        <button 
          onClick={() => setActiveTab('generate')}
          className="px-12 py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          ابدأ رحلة النجاح الآن
        </button>
      </div>
    </motion.div>
  );
};

export default GuideView;
