'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  User as UserIcon, 
  Mail, 
  Key, 
  Palette, 
  Loader2
} from 'lucide-react'
import { User } from '@supabase/supabase-js'

interface ProfileViewProps {
  user: User
  historyCount: number
  profileUsername: string
  setProfileUsername: (name: string) => void
  profileEmail: string
  setProfileEmail: (email: string) => void
  profilePassword: string
  setProfilePassword: (password: string) => void
  profileLoading: boolean
  handleUpdateProfile: (e: React.FormEvent) => void
  handleUpdateEmail: (e: React.FormEvent) => void
  handleUpdatePassword: (e: React.FormEvent) => void
  dashboardConfig: {
    showSmartSuggestions: boolean;
    showVariations: boolean;
    showAudience: boolean;
    showTone: boolean;
    showMetaLength: boolean;
    showKeywordCount: boolean;
    showSpecsFormat: boolean;
    showCompetitionLevel: boolean;
  }
  updateDashboardConfig: (key: string, value: boolean) => void
  handleLogout: () => void
  logoutLoading: boolean
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  historyCount,
  profileUsername,
  setProfileUsername,
  profileEmail,
  setProfileEmail,
  profilePassword,
  setProfilePassword,
  profileLoading,
  handleUpdateProfile,
  handleUpdateEmail,
  handleUpdatePassword,
  dashboardConfig,
  updateDashboardConfig,
  handleLogout,
  logoutLoading
}) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto w-full space-y-8"
    >
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">لوحة التحكم</h2>
            <p className="text-slate-500">{user.email}</p>
          </div>
          <div className="hidden sm:flex gap-4">
            <div className="text-center px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xl font-bold text-indigo-600">{historyCount}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">العمليات</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Update Profile Name */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              تحديث اسم الملف الشخصي
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="اسم المستخدم الجديد"
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث'}
              </button>
            </div>
          </form>

          <div className="h-px bg-slate-100" />

          {/* Update Email */}
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              تحديث البريد الإلكتروني
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="البريد الإلكتروني الجديد"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث'}
              </button>
            </div>
          </form>

          <div className="h-px bg-slate-100" />

          {/* Update Password */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              تغيير كلمة المرور
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'تحديث'}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-indigo-500" />
              تخصيص لوحة التحكم
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'showSmartSuggestions', label: 'إظهار اسم المنتج واقتراحاته' },
                { key: 'showVariations', label: 'إظهار حقل متغيرات المنتج' },
                { key: 'showAudience', label: 'إظهار خيار الجمهور المستهدف' },
                { key: 'showTone', label: 'إظهار خيار نبرة الصوت' },
                { key: 'showMetaLength', label: 'إظهار خيار طول الميتا' },
                { key: 'showKeywordCount', label: 'إظهار خيار عدد الكلمات' },
                { key: 'showSpecsFormat', label: 'إظهار خيار تنسيق المواصفات' },
                { key: 'showCompetitionLevel', label: 'إظهار خيار مستوى المنافسة' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-slate-100">
                  <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={dashboardConfig[item.key as keyof typeof dashboardConfig]}
                    onChange={(e) => updateDashboardConfig(item.key as keyof typeof dashboardConfig, e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center justify-between">
        <div>
          <h3 className="text-red-900 font-bold">تسجيل الخروج</h3>
          <p className="text-red-700 text-sm">سيتم إنهاء جلستك الحالية</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {logoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'خروج'}
        </button>
      </div>
    </motion.div>
  )
}
