'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Common';
import { Target, Network, UserCheck, Edit2, Sparkles, Search, FileText, Link as LinkIcon, BookOpen, CheckCircle2 } from 'lucide-react';
import { CrystalCard, SoftSolidCard } from '@/components/EliteUI';

const GuideView: React.FC = () => {
  return (
    <motion.div
      key="guide"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full -ml-32 -mb-32 blur-2xl" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-100 text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
            <Icon icon={BookOpen} className="w-4 h-4" />
            الدليل الشامل
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">استراتيجيات السيو (SEO) وأفضل الممارسات</h2>
          <p className="text-emerald-100/80 text-lg leading-relaxed max-w-2xl">
            تعلم كيف تتصدر نتائج البحث وتزيد من مبيعات منتجاتك من خلال تطبيق أحدث استراتيجيات تحسين محركات البحث.
          </p>
        </div>
        <div className="absolute bottom-0 left-10 p-8 opacity-10 hidden lg:block">
          <Icon icon={Sparkles} className="w-48 h-48" />
        </div>
      </div>

      {/* Main Strategies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Keyword Research */}
        <CrystalCard className="p-8 border-none shadow-xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
            <Icon icon={Search} className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-4">البحث عن الكلمات المفتاحية</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            الأساس لأي استراتيجية سيو ناجحة. فهم ما يبحث عنه عملاؤك وكيف يبحثون عنه هو الخطوة الأولى لتصدر النتائج.
          </p>
          <ul className="space-y-3">
            {[
              'استهداف الكلمات طويلة الذيل (Long-tail) لمعدل تحويل أعلى.',
              'تحليل نية البحث (Search Intent) للمستخدم.',
              'استخدام الكلمات المرتبطة دلالياً (LSI Keywords).',
              'مراقبة الكلمات المفتاحية للمنافسين.'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                <Icon icon={CheckCircle2} className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CrystalCard>

        {/* 2. On-Page Optimization */}
        <CrystalCard className="p-8 border-none shadow-xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
            <Icon icon={FileText} className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-4">تحسين السيو الداخلي (On-Page)</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            تحسين عناصر صفحة المنتج لتكون مفهومة لمحركات البحث وجذابة للمستخدمين في نفس الوقت.
          </p>
          <ul className="space-y-3">
            {[
              'كتابة عناوين (Title Tags) جذابة تتضمن الكلمة المفتاحية.',
              'تحسين الوصف التعريفي (Meta Description) لزيادة النقر.',
              'استخدام العناوين الفرعية (H1, H2, H3) لتنظيم المحتوى.',
              'إضافة نص بديل (Alt Text) للصور يحتوي على كلمات مفتاحية.',
              'كتابة وصف منتج فريد ومقنع يبرز الفوائد.'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                <Icon icon={CheckCircle2} className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CrystalCard>

        {/* 3. Link Building */}
        <CrystalCard className="p-8 border-none shadow-xl group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6">
            <Icon icon={LinkIcon} className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-4">بناء الروابط (Link Building)</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            زيادة موثوقية متجرك (Domain Authority) من خلال الحصول على روابط من مواقع أخرى ذات صلة.
          </p>
          <ul className="space-y-3">
            {[
              'الروابط الداخلية (Internal Links) لربط المنتجات ببعضها.',
              'الحصول على مراجعات من مدونين في نفس مجالك.',
              'نشر محتوى قيم (Guest Posting) في مواقع موثوقة.',
              'مشاركة المنتجات على منصات التواصل الاجتماعي.'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                <Icon icon={CheckCircle2} className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CrystalCard>
      </div>

      {/* Advanced Concepts Grid */}
      <h3 className="text-2xl font-black text-slate-900 mt-12 mb-6 px-2">مفاهيم متقدمة في السيو</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SoftSolidCard className="p-6 border-none shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon={Target} className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">الكلمات المفتاحية طويلة الذيل (Long-tail)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                هي عبارات بحث محددة جداً وتتكون عادة من 3 كلمات أو أكثر. على الرغم من أن حجم البحث عنها أقل، إلا أن معدل التحويل فيها أعلى بكثير لأنها تستهدف نية شراء محددة جداً.
              </p>
              <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block mb-1">مثال</span>
                <p className="text-xs font-bold text-slate-800">&quot;حذاء جري رياضي مريح للمسافات الطويلة&quot; بدلاً من &quot;حذاء&quot;</p>
              </div>
            </div>
          </div>
        </SoftSolidCard>

        <SoftSolidCard className="p-6 border-none shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon={Network} className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">تحسين البحث الدلالي (Semantic SEO)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                يركز على فهم المعنى والسياق وراء الكلمات بدلاً من مجرد تكرار الكلمة المفتاحية. محركات البحث تفهم العلاقات بين المفاهيم، لذا استخدام الكلمات المرتبطة يثبت خبرتك.
              </p>
              <div className="mt-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">نصيحة</span>
                <p className="text-xs font-bold text-slate-800">استخدم أداة &quot;الكلمات الثانوية&quot; في لوحة التوليد لتعزيز هذا الجانب.</p>
              </div>
            </div>
          </div>
        </SoftSolidCard>

        <SoftSolidCard className="p-6 border-none shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon={UserCheck} className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">مطابقة نية المستخدم (User Intent)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                هي الهدف الحقيقي للمستخدم من وراء عملية البحث. هل يريد الشراء؟ أم يبحث عن معلومات؟ أم يريد مقارنة منتجات؟ يجب أن يطابق محتواك هذه النية.
              </p>
              <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">الهدف</span>
                <p className="text-xs font-bold text-slate-800">تأكد من أن وصف منتجك يجيب على الأسئلة التي تدور في ذهن المشتري.</p>
              </div>
            </div>
          </div>
        </SoftSolidCard>

        <SoftSolidCard className="p-6 border-none shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon={Edit2} className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">هيكلة المحتوى (Content Structure)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                استخدم العناوين (H1, H2, H3) بشكل هرمي منطقي. العنوان الرئيسي يجب أن يحتوي على الكلمة المفتاحية، والعناوين الفرعية يجب أن تنظم الأفكار وتسهل القراءة.
              </p>
              <div className="mt-4 p-3 bg-rose-50/50 rounded-lg border border-rose-100/50">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block mb-1">نصيحة</span>
                <p className="text-xs font-bold text-slate-800">لا تكرر الكلمة المفتاحية في كل عنوان، بل استخدم مرادفات.</p>
              </div>
            </div>
          </div>
        </SoftSolidCard>
      </div>
    </motion.div>
  );
};

export default GuideView;
