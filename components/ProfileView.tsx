'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  Check, 
  LogOut, 
  Layout, 
  History, 
  Shield, 
  MessageSquare
} from 'lucide-react';
import { CrystalCard, AppTextField, PrimaryButton } from './EliteUI';
import { Icon } from './Common';

import type { User as SupabaseUser } from '@supabase/supabase-js';

import { HistoryItem } from '@/types';

interface ProfileViewProps {
  user: SupabaseUser | null;
  profileUsername: string;
  setProfileUsername: (val: string) => void;
  profileEmail: string;
  setProfileEmail: (val: string) => void;
  profilePassword: string;
  setProfilePassword: (val: string) => void;
  handleUpdateProfile: (e: React.FormEvent) => void;
  handleUpdateEmail: (e: React.FormEvent) => void;
  handleUpdatePassword: (e: React.FormEvent) => void;
  profileLoading: boolean;
  history: HistoryItem[];
  dashboardConfig: Record<string, boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDashboardConfig: (key: any, val: boolean) => void | Promise<void>;
  handleLogout: () => void;
  logoutLoading: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profileUsername,
  setProfileUsername,
  profileEmail,
  setProfileEmail,
  profilePassword,
  setProfilePassword,
  handleUpdateProfile,
  handleUpdateEmail,
  handleUpdatePassword,
  profileLoading,
  history,
  dashboardConfig,
  updateDashboardConfig,
  handleLogout,
  logoutLoading
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <section className="lg:col-span-4 space-y-6">
        <CrystalCard className="p-8 text-center border-none shadow-xl shadow-emerald-500/5">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] blur-xl opacity-20 animate-pulse" />
            <div className="relative w-full h-full rounded-[2.5rem] bg-slate-900 flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden">
              <User className="w-16 h-16 text-white/20" />
              {user?.user_metadata?.avatar_url && (
                <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
              <Check className="w-5 h-5" />
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-1">{user?.user_metadata?.username || 'مستخدم كريستال'}</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">{user?.email}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mb-0.5">{history.length}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">محتوى مولد</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xl font-black text-emerald-600 mb-0.5">نشط</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">حالة الحساب</div>
            </div>
          </div>
        </CrystalCard>

        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full p-6 bg-rose-50 text-rose-600 font-black rounded-[2rem] border border-rose-100 hover:bg-rose-100 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 group disabled:opacity-50"
        >
          {logoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
          تسجيل الخروج من الحساب
        </button>
      </section>

      <div className="lg:col-span-8 space-y-8">
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/100/10 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-500/20">
              <Shield className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات الأمان والملف الشخصي</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">قم بتحديث معلوماتك الشخصية وكلمة المرور</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">اسم المستخدم</label>
                <AppTextField
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  placeholder="أدخل اسمك الجديد..."
                  icon={User}
                />
              </div>
              <PrimaryButton onClick={handleUpdateProfile} loading={profileLoading} className="py-4 text-xs">تحديث الاسم</PrimaryButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">البريد الإلكتروني</label>
                <AppTextField
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="أدخل بريدك الجديد..."
                  icon={Mail}
                  dir="ltr"
                />
              </div>
              <PrimaryButton onClick={handleUpdateEmail} loading={profileLoading} className="py-4 text-xs">تحديث البريد</PrimaryButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">كلمة المرور الجديدة</label>
                <AppTextField
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="أدخل كلمة مرور قوية..."
                  icon={Lock}
                  dir="ltr"
                />
              </div>
              <PrimaryButton onClick={handleUpdatePassword} loading={profileLoading} className="py-4 text-xs">تحديث كلمة المرور</PrimaryButton>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-500/20">
              <Layout className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">تخصيص لوحة التحكم</h2>
              <p className="text-sm font-bold text-slate-400 mt-1">اختر العناصر التي تود رؤيتها في واجهة التوليد</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'showAudience', label: 'الجمهور المستهدف', icon: User },
              { key: 'showTone', label: 'نبرة الصوت', icon: MessageSquare },
              { key: 'showLsi', label: 'الكلمات الثانوية (LSI)', icon: History },
              { key: 'showCompetitor', label: 'تحليل المنافسين', icon: Shield }
            ].map((item) => (
              <div 
                key={item.key}
                onClick={() => updateDashboardConfig(item.key, !dashboardConfig[item.key])}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${
                  dashboardConfig[item.key] ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    dashboardConfig[item.key] ? 'bg-white text-emerald-700 dark:text-emerald-400 shadow-sm' : 'bg-white text-slate-400'
                  }`}>
                    <Icon icon={item.icon} className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-black ${dashboardConfig[item.key] ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-600'}`}>{item.label}</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  dashboardConfig[item.key] ? 'bg-emerald-700 text-white scale-110' : 'bg-slate-200'
                }`}>
                  {dashboardConfig[item.key] && <Check className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default ProfileView;
