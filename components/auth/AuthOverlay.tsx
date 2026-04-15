'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Mail, Key, LogIn, UserPlus, Send, AlertCircle, Loader2, User as UserIcon 
} from 'lucide-react';
import { Icon } from '@/components/Common';

interface AuthOverlayProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (email: string, pass: string, username: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthOverlay = ({
  onLogin,
  onSignup,
  onResetPassword,
  loading,
  error
}: AuthOverlayProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      await onLogin(email, password);
    } else if (authMode === 'signup') {
      if (password !== confirmPassword) {
        return; // Handle error elsewhere or add local error
      }
      await onSignup(email, password, username);
    } else {
      await onResetPassword(email);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50">
      <div 
        className="w-full max-w-md app-card border rounded-2xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-700 text-white mb-4 shadow-lg shadow-emerald-100">
            <Icon icon={Sparkles} className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">مرحباً بك في خبير السيو</h1>
          <p className="text-slate-500 mt-2">سجل دخولك للبدء في توليد المحتوى</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
            <Icon icon={AlertCircle} className="w-5 h-5 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Icon icon={UserIcon} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                اسم المستخدم
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Icon icon={Mail} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
              placeholder="email@example.com"
            />
          </div>

          {authMode !== 'reset' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Icon icon={Key} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          {authMode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Icon icon={Key} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Icon icon={authMode === 'login' ? LogIn : authMode === 'signup' ? UserPlus : Send} className="w-5 h-5" />
                {authMode === 'login' ? 'تسجيل الدخول' : authMode === 'signup' ? 'إنشاء حساب' : 'إرسال رابط الاستعادة'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-3">
          {authMode === 'login' ? (
            <>
              <button onClick={() => setAuthMode('signup')} className="text-emerald-600 font-semibold hover:underline block w-full">
                ليس لديك حساب؟ سجل الآن
              </button>
              <button onClick={() => setAuthMode('reset')} className="text-slate-500 text-sm hover:underline block w-full">
                نسيت كلمة المرور؟
              </button>
            </>
          ) : (
            <button onClick={() => setAuthMode('login')} className="text-emerald-600 font-semibold hover:underline block w-full">
              لديك حساب بالفعل؟ سجل دخولك
            </button>
          )}
          <div className="pt-4 text-slate-400 text-xs font-bold">
            خبير السيو / أبو شيماء
          </div>
        </div>
      </div>
    </main>
  );
};
