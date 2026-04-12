// components/subscription/UpgradeModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Check, Lock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onUpgradeClick: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  featureName = 'هذه الميزة',
  onUpgradeClick
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>

          <div className="p-8 md:p-10 text-center">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
              <Lock className="w-10 h-10 text-amber-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
              قم بترقية باقتك للوصول إلى {featureName}
            </h2>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">
              لقد انتهت فترتك التجريبية المجانية، أو أن هذه الميزة متوفرة فقط في الباقات المتقدمة.
              <br />
              <span className="text-purple-600 font-black">اشترك الآن للاستمرار في استخدام كافة الميزات!</span>
            </p>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-right space-y-3 border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ما ستحصل عليه عند الترقية:</p>
              {[
                'تحليلات سيو غير محدودة',
                'توليد محتوى ذكي متقدم',
                'Auto SEO Engine المطور',
                'دعم فني مخصص'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onUpgradeClick}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap size={18} className="fill-current" />
                <span>عرض خطط الأسعار</span>
              </button>
              <button 
                onClick={onClose}
                className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors py-2"
              >
                ربما لاحقاً
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
