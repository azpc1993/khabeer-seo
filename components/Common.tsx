'use client';

import React from 'react';
import { LucideIcon, X, ChevronDown, ChevronUp, Save } from 'lucide-react';

// Reusable Icon Component
export const Icon = ({ icon: IconComponent, className = "w-4 h-4", size }: { icon: LucideIcon, className?: string, size?: number | string }) => {
  if (!IconComponent) {
    console.warn("Icon component is undefined");
    return null;
  }
  return <IconComponent className={className} size={size} />;
};

export const KeywordChip = ({ keyword, onRemove }: { keyword: string, onRemove: () => void }) => (
  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
    {keyword}
    <button onClick={onRemove} className="text-emerald-400 hover:text-emerald-600">
      <Icon icon={X} className="w-3 h-3" />
    </button>
  </span>
);

export const Tooltip = ({ text, content, children }: { text?: string, content?: string, children: React.ReactNode }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
      {text || content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export const SettingsAccordion = ({ 
  title, 
  icon: IconComponent, 
  children, 
  isOpen, 
  onToggle, 
  showSave, 
  onSave 
}: { 
  title: string, 
  icon: LucideIcon, 
  children: React.ReactNode, 
  isOpen: boolean, 
  onToggle: () => void, 
  showSave?: boolean, 
  onSave?: () => void 
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
    <button 
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${isOpen ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-500'}`}>
          <Icon icon={IconComponent} className="w-5 h-5" />
        </div>
        <span className={`text-sm font-black tracking-tight ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
      </div>
      <div className="flex items-center gap-3">
        {showSave && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSave?.(); }}
            className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-1.5"
          >
            <Save className="w-3 h-3" />
            <span>حفظ</span>
          </button>
        )}
        <Icon icon={isOpen ? ChevronUp : ChevronDown} className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
      </div>
    </button>
    <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 border-t border-slate-50' : 'max-h-0 opacity-0 pointer-events-none'}`}>
      <div className="p-6 bg-slate-50/30">
        {children}
      </div>
    </div>
  </div>
);
