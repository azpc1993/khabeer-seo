'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

/* ============================================================
   MeshBackground — replaces the old indigo blobs
   Now uses the Teal & Ink brand background
   ============================================================ */
export const MeshBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen app-main relative overflow-x-hidden font-cairo selection:bg-emerald-100 selection:text-emerald-900">
    {/* Subtle decorative orbs — teal tones, very low opacity */}
    <div
      className="pointer-events-none fixed -top-32 -right-32 w-[520px] h-[520px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', willChange: 'transform' }}
    />
    <div
      className="pointer-events-none fixed -bottom-32 -left-32 w-[440px] h-[440px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(15,76,58,0.06) 0%, transparent 70%)', willChange: 'transform' }}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

/* ============================================================
   CrystalCard — glassmorphism card, now with teal tint
   ============================================================ */
export interface CrystalCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  onClick?: () => void;
}

export const CrystalCard = ({
  children,
  className = '',
  blur = 8,
  onClick,
}: CrystalCardProps) => (
  <div
    className={`app-card border rounded-[20px] p-6 ${className}`}
    style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, willChange: 'transform, opacity' }}
    onClick={onClick}
  >
    {children}
  </div>
);

/* ============================================================
   SoftSolidCard — standard content card
   ============================================================ */
export const SoftSolidCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`app-card border rounded-[16px] p-6 ${className}`}>
    {children}
  </div>
);

/* ============================================================
   PrimaryButton — full-width CTA button
   ============================================================ */
export const PrimaryButton = ({
  label,
  children,
  onClick,
  loading,
  disabled,
  icon: IconComponent,
  className = '',
}: {
  label?: string;
  children?: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`w-full h-14 app-btn-primary font-bold rounded-[14px] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${className}`}
  >
    {loading ? (
      <div className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5" />
    ) : (
      <>
        {IconComponent && <IconComponent className="w-5 h-5" />}
        {label && <span>{label}</span>}
        {children}
      </>
    )}
  </button>
);

/* ============================================================
   AppTextField — unified text input / textarea
   ============================================================ */
interface AppTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
}

export const AppTextField = ({
  label,
  icon: FieldIcon,
  helperText,
  className = '',
  multiline,
  rows = 4,
  ...props
}: AppTextFieldProps) => (
  <div className={`space-y-2 group ${className}`}>
    {label && <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-1">{label}</label>}
    <div className="relative">
      {multiline ? (
        <textarea
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={rows}
          className="app-input w-full border rounded-[12px] px-5 py-4 focus:ring-0 outline-none transition-all text-right font-medium placeholder:opacity-60 text-base resize-none"
        />
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          className="app-input w-full border rounded-[12px] px-5 py-4 focus:ring-0 outline-none transition-all text-right font-medium placeholder:opacity-60 text-base"
        />
      )}
      {FieldIcon && (
        <FieldIcon
          size={18}
          className={`absolute left-5 ${multiline ? 'top-5' : 'top-1/2 -translate-y-1/2'} text-emerald-400 group-focus-within:text-emerald-600 transition-colors`}
        />
      )}
    </div>
    {helperText && <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2">{helperText}</p>}
  </div>
);

/* ============================================================
   EliteButton — multi-variant button
   ============================================================ */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ai' | 'secondary' | 'ghost' | 'teal';
}

export const EliteButton = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) => {
  const variants: Record<string, string> = {
    primary: 'app-btn-primary rounded-2xl',
    teal:    'app-btn-accent rounded-2xl',
    ai:      'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-200/50 hover:opacity-90 active:scale-95 rounded-2xl',
    secondary: 'bg-white/80 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-slate-100 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl',
    ghost:   'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl',
  };

  return (
    <button
      className={`relative px-6 py-4 font-bold transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden active:scale-95 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/* ============================================================
   BentoCard — dashboard-style card with icon header
   ============================================================ */
interface BentoCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export const BentoCard = ({
  children,
  title,
  icon: CardIcon,
  badge,
  className = '',
}: BentoCardProps) => (
  <div className={`group app-card border rounded-2xl p-6 transition-all duration-300 ${className}`}>
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        {CardIcon && (
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <CardIcon size={20} />
          </div>
        )}
        {title && <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
      </div>
      {badge && (
        <span className="brand-badge px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

/* ============================================================
   ModernField — labeled input with icon
   ============================================================ */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const ModernField = ({ label, icon: FieldIcon, helperText, ...props }: FieldProps) => (
  <div className="space-y-2 group">
    {label && (
      <label className="text-xs font-black text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-2 uppercase tracking-widest">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        {...props}
        className="app-input w-full border rounded-2xl px-5 py-4 outline-none transition-all text-right font-bold placeholder:opacity-50 text-base"
      />
      {FieldIcon && (
        <FieldIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
      )}
    </div>
    {helperText && <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2">{helperText}</p>}
  </div>
);

/* ============================================================
   ModernTextarea
   ============================================================ */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export const ModernTextarea = ({ label, icon: FieldIcon, helperText, ...props }: TextareaProps) => (
  <div className="space-y-2 group">
    {label && (
      <label className="text-xs font-black text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-2 uppercase tracking-widest">
        {label}
      </label>
    )}
    <div className="relative">
      <textarea
        {...props}
        className="app-input w-full border rounded-2xl px-5 py-4 outline-none transition-all text-right font-bold placeholder:opacity-50 min-h-[100px] text-base resize-none"
      />
      {FieldIcon && (
        <FieldIcon size={18} className="absolute left-5 top-5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
      )}
    </div>
    {helperText && <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2">{helperText}</p>}
  </div>
);
