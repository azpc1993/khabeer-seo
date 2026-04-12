// components/subscription/FeatureGuard.tsx
'use client';

import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { isFeatureLockedAtom } from '@/store/subscriptionStore';
import { UpgradeModal } from './UpgradeModal';
import { Lock } from 'lucide-react';

interface FeatureGuardProps {
  featureKey: string;
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradeClick: () => void;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ 
  featureKey, 
  featureName, 
  children, 
  fallback,
  onUpgradeClick
}) => {
  const isLockedFn = useAtomValue(isFeatureLockedAtom);
  const isLocked = isLockedFn(featureKey);
  const [showModal, setShowModal] = useState(false);

  if (!isLocked) {
    return <>{children}</>;
  }

  if (fallback) {
    return (
      <div onClick={() => setShowModal(true)} className="cursor-pointer">
        {fallback}
        <UpgradeModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          featureName={featureName}
          onUpgradeClick={onUpgradeClick}
        />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none grayscale">
        {children}
      </div>
      <div 
        onClick={() => setShowModal(true)}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[1px] rounded-xl cursor-pointer hover:bg-slate-900/10 transition-all"
      >
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 group-hover:scale-110 transition-transform">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        <p className="mt-3 text-[10px] font-black text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
          مطلوب الترقية
        </p>
      </div>
      <UpgradeModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        featureName={featureName}
        onUpgradeClick={onUpgradeClick}
      />
    </div>
  );
};
