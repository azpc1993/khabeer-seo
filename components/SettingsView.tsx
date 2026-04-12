'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  ChevronDown, 
  Globe, 
  Moon, 
  Zap, 
  Sparkles, 
  FileText, 
  Search, 
  History, 
  Bell, 
  Info, 
  LogOut, 
  Check, 
  AlertCircle, 
  User,
  Link as LinkIcon
} from 'lucide-react';
import { CrystalCard, AppTextField, PrimaryButton } from './EliteUI';
import { IntegrationsPanel } from './integrations/IntegrationsPanel';

import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface SettingsViewProps {
  user: SupabaseUser | null;
  openAccordion: string | null;
  setOpenAccordion: (val: string | null) => void;
  isSectionModified: (section: string) => boolean;
  handleSaveSection: (section: string) => void;
  appLanguage: string;
  setAppLanguage: (val: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isMotionEnabled: boolean;
  setIsMotionEnabled: (val: boolean) => void;
  descriptionLength: string;
  setDescriptionLength: (val: string) => void;
  toneOfVoice: string;
  setToneOfVoice: (val: string) => void;
  seoLevel: string;
  setSeoLevel: (val: string) => void;
  includeKeywords: boolean;
  setIncludeKeywords: (val: boolean) => void;
  copyFormat: string;
  setCopyFormat: (val: string) => void;
  autoFormat: string;
  setAutoFormat: (val: string) => void;
  mergeSpecs: boolean;
  setMergeSpecs: (val: boolean) => void;
  preserveFormatting: boolean;
  setPreserveFormatting: (val: boolean) => void;
  autoSuggestKeywords: boolean;
  setAutoSuggestKeywords: (val: boolean) => void;
  showLsiInput: boolean;
  setShowLsiInput: (val: boolean) => void;
  blockedKeywords: string;
  setBlockedKeywords: (val: string) => void;
  historyEnabled: boolean;
  setHistoryEnabled: (val: boolean) => void;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (val: boolean) => void;
  genNotifications: boolean;
  setGenNotifications: (val: boolean) => void;
  errorNotifications: boolean;
  setErrorNotifications: (val: boolean) => void;
  handleLogout: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  openAccordion,
  setOpenAccordion,
  isSectionModified,
  handleSaveSection,
  appLanguage,
  setAppLanguage,
  isDarkMode,
  setIsDarkMode,
  isMotionEnabled,
  setIsMotionEnabled,
  descriptionLength,
  setDescriptionLength,
  toneOfVoice,
  setToneOfVoice,
  seoLevel,
  setSeoLevel,
  includeKeywords,
  setIncludeKeywords,
  copyFormat,
  setCopyFormat,
  autoFormat,
  setAutoFormat,
  mergeSpecs,
  setMergeSpecs,
  preserveFormatting,
  setPreserveFormatting,
  autoSuggestKeywords,
  setAutoSuggestKeywords,
  showLsiInput,
  setShowLsiInput,
  blockedKeywords,
  setBlockedKeywords,
  historyEnabled,
  setHistoryEnabled,
  autoSaveEnabled,
  setAutoSaveEnabled,
  genNotifications,
  setGenNotifications,
  errorNotifications,
  setErrorNotifications,
  handleLogout
}) => {
  const sections = [
    { id: 'general', title: 'إعدادات عامة', icon: Globe },
    { id: 'generation', title: 'تفضيلات التوليد', icon: Zap },
    { id: 'formatting', title: 'التنسيق والنسخ', icon: FileText },
    { id: 'keywords', title: 'إدارة الكلمات المفتاحية', icon: Search },
    { id: 'integrations', title: 'الربط والتكاملات', icon: LinkIcon },
    { id: 'data', title: 'إدارة البيانات', icon: History },
    { id: 'notifications', title: 'التنبيهات', icon: Bell },
    { id: 'about', title: 'حول التطبيق', icon: Info }
  ];

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      <section className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
            <Settings className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات التطبيق</h2>
            <p className="text-sm font-bold text-slate-400 mt-1">خصص تجربتك مع كريستال سيو لتناسب احتياجاتك</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <CrystalCard key={section.id} className="overflow-hidden border-slate-100 hover:border-emerald-200 transition-all">
              <button
                onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    openAccordion === section.id ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <section.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-black ${openAccordion === section.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {section.title}
                  </span>
                  {isSectionModified(section.id) && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${openAccordion === section.id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openAccordion === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-100 bg-slate-50/30"
                  >
                    <div className="p-5 space-y-6">
                      {section.id === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">لغة التطبيق</label>
                            <select
                              value={appLanguage}
                              onChange={(e) => setAppLanguage(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="ar">العربية (الافتراضية)</option>
                              <option value="en">English (Coming Soon)</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Moon className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">الوضع الليلي</span>
                            </div>
                            <button
                              onClick={() => setIsDarkMode(!isDarkMode)}
                              className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">تفعيل الحركات (Animations)</span>
                            </div>
                            <button
                              onClick={() => setIsMotionEnabled(!isMotionEnabled)}
                              className={`w-12 h-6 rounded-full transition-all relative ${isMotionEnabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMotionEnabled ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'generation' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">طول الوصف المفضل</label>
                            <select
                              value={descriptionLength}
                              onChange={(e) => setDescriptionLength(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="short">قصير (100-150 كلمة)</option>
                              <option value="medium">متوسط (200-300 كلمة)</option>
                              <option value="long">طويل (400+ كلمة)</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">نبرة الصوت الافتراضية</label>
                            <select
                              value={toneOfVoice}
                              onChange={(e) => setToneOfVoice(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="احترافي">احترافي</option>
                              <option value="ودي">ودي</option>
                              <option value="إبداعي">إبداعي</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">مستوى تحسين السيو</label>
                            <select
                              value={seoLevel}
                              onChange={(e) => setSeoLevel(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="standard">قياسي</option>
                              <option value="aggressive">متقدم (Aggressive)</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Sparkles className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">تضمين الكلمات في العناوين</span>
                            </div>
                            <button
                              onClick={() => setIncludeKeywords(!includeKeywords)}
                              className={`w-12 h-6 rounded-full transition-all relative ${includeKeywords ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeKeywords ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'formatting' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">التنسيق التلقائي للمحتوى</label>
                            <select
                              value={autoFormat}
                              onChange={(e) => setAutoFormat(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="plain">نص عادي</option>
                              <option value="markdown">Markdown</option>
                              <option value="html">HTML</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">تنسيق النسخ الافتراضي</label>
                            <select
                              value={copyFormat}
                              onChange={(e) => setCopyFormat(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-700 dark:text-white focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                              <option value="plain">نص عادي</option>
                              <option value="markdown">Markdown</option>
                              <option value="html">HTML</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">دمج المواصفات الفنية</span>
                            </div>
                            <button
                              onClick={() => setMergeSpecs(!mergeSpecs)}
                              className={`w-12 h-6 rounded-full transition-all relative ${mergeSpecs ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${mergeSpecs ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Check className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">الحفاظ على التنسيق الأصلي</span>
                            </div>
                            <button
                              onClick={() => setPreserveFormatting(!preserveFormatting)}
                              className={`w-12 h-6 rounded-full transition-all relative ${preserveFormatting ? 'bg-emerald-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preserveFormatting ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'keywords' && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                              <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">اقتراح كلمات تلقائياً</span>
                              </div>
                              <button
                                onClick={() => setAutoSuggestKeywords(!autoSuggestKeywords)}
                                className={`w-12 h-6 rounded-full transition-all relative ${autoSuggestKeywords ? 'bg-emerald-700' : 'bg-slate-200'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoSuggestKeywords ? 'right-7' : 'right-1'}`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                              <div className="flex items-center gap-3">
                                <History className="w-5 h-5 text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">إظهار حقل الكلمات الثانوية</span>
                              </div>
                              <button
                                onClick={() => setShowLsiInput(!showLsiInput)}
                                className={`w-12 h-6 rounded-full transition-all relative ${showLsiInput ? 'bg-emerald-700' : 'bg-slate-200'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showLsiInput ? 'right-7' : 'right-1'}`} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider px-1">الكلمات المحظورة (مفصولة بفاصلة)</label>
                            <AppTextField
                              value={blockedKeywords}
                              onChange={(e) => setBlockedKeywords(e.target.value)}
                              placeholder="مثال: رخيص، مجاني، عرض خاص"
                              icon={AlertCircle}
                            />
                          </div>
                        </div>
                      )}

                      {section.id === 'integrations' && (
                        <div className="space-y-4">
                          <div className="mb-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">إعدادات الربط والتكاملات</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">اربط حساباتك للحصول على بيانات حقيقية وتحليلها داخل التطبيق.</p>
                          </div>
                          <IntegrationsPanel />
                        </div>
                      )}

                      {section.id === 'data' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <History className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">تفعيل سجل التوليد</span>
                            </div>
                            <button
                              onClick={() => setHistoryEnabled(!historyEnabled)}
                              className={`w-12 h-6 rounded-full transition-all relative ${historyEnabled ? 'bg-emerald-700' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${historyEnabled ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">حفظ تلقائي للمسودات</span>
                            </div>
                            <button
                              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                              className={`w-12 h-6 rounded-full transition-all relative ${autoSaveEnabled ? 'bg-emerald-700' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoSaveEnabled ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'notifications' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">تنبيهات التوليد الناجح</span>
                            </div>
                            <button
                              onClick={() => setGenNotifications(!genNotifications)}
                              className={`w-12 h-6 rounded-full transition-all relative ${genNotifications ? 'bg-emerald-700' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${genNotifications ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-700">تنبيهات الأخطاء</span>
                            </div>
                            <button
                              onClick={() => setErrorNotifications(!errorNotifications)}
                              className={`w-12 h-6 rounded-full transition-all relative ${errorNotifications ? 'bg-emerald-700' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${errorNotifications ? 'right-7' : 'right-1'}`} />
                            </button>
                          </div>
                        </div>
                      )}

                      {section.id === 'about' && (
                        <div className="space-y-6 text-center">
                          <div className="w-20 h-20 bg-emerald-700 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xl font-black text-slate-900">كريستال سيو v2.0</h4>
                            <p className="text-sm font-bold text-slate-400">أقوى أداة لتوليد محتوى السيو بالذكاء الاصطناعي</p>
                          </div>
                          <div className="pt-4 flex justify-center gap-4">
                            <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">صنع بكل حب في السعودية 🇸🇦</div>
                          </div>
                        </div>
                      )}

                      {section.id !== 'about' && (
                        <div className="pt-4 flex justify-end">
                          <PrimaryButton
                            onClick={() => handleSaveSection(section.id)}
                            disabled={!isSectionModified(section.id)}
                            className="px-8 py-3 text-xs"
                          >
                            حفظ التغييرات
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CrystalCard>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">أنت مسجل كـ</p>
              <p className="text-sm font-bold text-slate-900">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-black text-rose-600 hover:text-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>
      </section>
    </motion.div>
  );
};

export default SettingsView;
