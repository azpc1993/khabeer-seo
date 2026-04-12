'use client';

import React from 'react';
import { 
  Sparkles, 
  Zap, 
  History, 
  Plus, 
  Search, 
  TrendingUp, 
  Package, 
  ChevronLeft,
  Users,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Icon } from '@/components/Common';
import { CrystalCard, PrimaryButton, SoftSolidCard } from '@/components/EliteUI';

import type { User as SupabaseUser } from '@supabase/supabase-js';

import { HistoryItem } from '@/types';

export interface HomeViewProps {
  user: SupabaseUser | null;
  setActiveTab: (tab: string) => void;
  history: HistoryItem[];
  trackedProducts: {
    id: string;
    name: string;
    url: string;
    keyword: string;
    rank: number | null;
    last_checked: string | null;
  }[];
  dailyUsage: number;
  seoTip: string;
  setSeoTip: (tip: string) => void;
  seoTips: string[];
  setResult: (result: string) => void;
  setProductName: (name: string) => void;
}

const keywordPerformanceData = [
  { name: 'يناير', volume: 4000, clicks: 2400 },
  { name: 'فبراير', volume: 3000, clicks: 1398 },
  { name: 'مارس', volume: 2000, clicks: 9800 },
  { name: 'أبريل', volume: 2780, clicks: 3908 },
  { name: 'مايو', volume: 1890, clicks: 4800 },
  { name: 'يونيو', volume: 2390, clicks: 3800 },
  { name: 'يوليو', volume: 3490, clicks: 4300 },
];

const userActivityData = [
  { day: 'السبت', active: 120 },
  { day: 'الأحد', active: 200 },
  { day: 'الإثنين', active: 150 },
  { day: 'الثلاثاء', active: 300 },
  { day: 'الأربعاء', active: 250 },
  { day: 'الخميس', active: 400 },
  { day: 'الجمعة', active: 350 },
];

export default function HomeView({
  user,
  setActiveTab,
  history,
  trackedProducts,
  dailyUsage,
  seoTip,
  setSeoTip,
  seoTips,
  setResult,
  setProductName
}: HomeViewProps) {
  return (
    <div className="space-y-6 px-4 sm:px-8 py-6">
      {/* Hero Section */}
      <CrystalCard className="relative overflow-hidden border-none shadow-2xl shadow-emerald-100/50">
        <div className="relative z-10">
          <span className="inline-block px-4 py-1.5 bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-emerald-200 dark:border-emerald-800/30">
            مرحباً بك في النسخة الاحترافية
          </span>
          <h3 className="text-3xl font-black mb-3 leading-tight text-slate-900">مرحباً بك، {user?.user_metadata?.username || 'عزالدين الحسني'}! 👋</h3>
          <p className="text-slate-600 max-w-md text-sm font-medium leading-relaxed">نحن هنا لمساعدتك في تصدر نتائج البحث وزيادة مبيعات متجرك باستخدام أحدث تقنيات الذكاء الاصطناعي.</p>
          
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton 
              label="ابدأ التوليد الآن"
              onClick={() => setActiveTab('generate')}
              icon={Zap}
              className="!w-auto px-8"
            />
            <button 
              onClick={() => {
                if (history.length > 0) {
                  setResult(history[0].result || '');
                  setProductName(history[0].product_name || '');
                  setActiveTab('generate');
                } else {
                  // This should be handled by a toast in page.tsx or passed down
                  // For now, assume it's handled
                }
              }} 
              className="bg-white/60 backdrop-blur-md text-slate-700 px-8 py-4 rounded-[16px] font-black text-sm hover:bg-white/80 transition-all border border-slate-200 flex items-center gap-2"
            >
              <Icon icon={History} className="w-4 h-4" />
              <span>عرض آخر مشروع</span>
            </button>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-100 dark:bg-emerald-900/20/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-100/20 rounded-full blur-2xl pointer-events-none" />
      </CrystalCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'توليد جديد', icon: Sparkles, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10', tab: 'generate' as const },
          { label: 'إضافة منتج', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'product' as const },
          { label: 'بحث كلمات', icon: Search, color: 'text-amber-600', bg: 'bg-amber-50', tab: 'research' as const },
          { label: 'المحفوظات', icon: History, color: 'text-rose-600', bg: 'bg-rose-50', tab: 'history' as const }
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(action.tab)}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-[1.05] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex flex-col items-center gap-3 group"
          >
            <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon icon={action.icon} className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CrystalCard className="p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600">إجمالي الزيارات</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Icon icon={Users} className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">24,592</span>
            <span className="flex items-center text-sm font-bold text-emerald-600 mb-1">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12.5%
            </span>
          </div>
        </CrystalCard>

        <CrystalCard className="p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600">متوسط الترتيب</h3>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Icon icon={TrendingUp} className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">14.2</span>
            <span className="flex items-center text-sm font-bold text-emerald-600 mb-1">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +2.4
            </span>
          </div>
        </CrystalCard>

        <CrystalCard className="p-6 border-none shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-600">معدل الارتداد</h3>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Icon icon={TrendingUp} className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">42.3%</span>
            <span className="flex items-center text-sm font-bold text-rose-600 mb-1">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              -1.5%
            </span>
          </div>
        </CrystalCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SoftSolidCard className="p-6 border-none shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">أداء الكلمات المفتاحية</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={keywordPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="volume" name="حجم البحث" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="clicks" name="النقرات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SoftSolidCard>

        <SoftSolidCard className="p-6 border-none shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6">نشاط المستخدمين الأسبوعي</h3>
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="active" name="المستخدمين النشطين" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftSolidCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Last Activity Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-700 dark:text-emerald-400">
                <Icon icon={TrendingUp} className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">آخر نشاط</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تحديث تلقائي</span>
          </div>
          
          {history.length > 0 ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Icon icon={Package} className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{history[0].product_name}</p>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Icon icon={History} className="w-3 h-3" />
                    تم التوليد: {(() => {
                      const date = history[0].created_at;
                      if (!date) return 'غير معروف';
                      if (typeof date === 'object' && 'toMillis' in date && date.toMillis) return new Date(date.toMillis()).toLocaleDateString('ar-SA');
                      return new Date(date as string | number).toLocaleDateString('ar-SA');
                    })()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setResult(history[0].result || '');
                  setProductName(history[0].product_name || '');
                  setActiveTab('generate');
                }}
                className="p-3 bg-white text-emerald-700 dark:text-emerald-400 rounded-xl shadow-sm border border-slate-100 hover:bg-emerald-50 dark:bg-emerald-900/10 transition-all"
              >
                <Icon icon={ChevronLeft} className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400 font-bold">لا يوجد نشاط سابق</p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">إجمالي التوليد</p>
              <p className="text-lg font-black text-slate-900">{history.length}</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">المنتجات</p>
              <p className="text-lg font-black text-slate-900">{trackedProducts.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">الكلمات</p>
              <p className="text-lg font-black text-slate-900">{dailyUsage}</p>
            </div>
          </div>
        </div>

        {/* SEO Tip Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-md relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Icon icon={Lightbulb} className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">نصيحة اليوم</h4>
            </div>
            
            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 min-h-[140px] flex flex-col justify-center">
              <p className="text-base font-bold text-slate-800 leading-relaxed text-center italic">
                &quot;{seoTip}&quot;
              </p>
            </div>

            <button 
              onClick={() => {
                const randomTip = seoTips[Math.floor(Math.random() * seoTips.length)];
                setSeoTip(randomTip);
              }}
              className="w-full mt-4 py-3 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-50 rounded-xl transition-all"
            >
              تغيير النصيحة
            </button>
          </div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-100/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
}
