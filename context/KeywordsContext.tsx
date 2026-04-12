'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface KeywordsContextType {
  selectedKeywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  clearKeywords: () => void;
}

const KeywordsContext = createContext<KeywordsContextType | undefined>(undefined);

export function KeywordsProvider({ children }: { children: ReactNode }) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const addKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(keyword)) {
        toast.info(`الكلمة "${keyword}" مضافة مسبقاً`);
        return prev;
      }
      toast.success(`تمت إضافة: ${keyword}`);
      return [...prev, keyword];
    });
  };

  const removeKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const clearKeywords = () => setSelectedKeywords([]);

  return (
    <KeywordsContext.Provider value={{ selectedKeywords, addKeyword, removeKeyword, clearKeywords }}>
      {children}
    </KeywordsContext.Provider>
  );
}

export const useKeywords = () => {
  const context = useContext(KeywordsContext);
  if (!context) throw new Error('useKeywords must be used within KeywordsProvider');
  return context;
};
