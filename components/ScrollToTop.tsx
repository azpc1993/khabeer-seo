'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={scrollToTop}
          /* bottom-28 on mobile so it clears the bottom nav bar (h-20 ~80px + gap),
             bottom-8 on desktop. left-4 keeps it small and out of the way. */
          className="fixed bottom-28 lg:bottom-8 left-4 z-40 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full shadow-md hover:text-emerald-600 hover:border-emerald-300 transition-all active:scale-90"
          aria-label="الرجوع إلى أعلى"
        >
          <ChevronUp className="w-4 h-4 mx-auto" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
