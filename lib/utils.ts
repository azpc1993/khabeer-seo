import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const highlightText = (text: string, keywords: string[]) => {
  if (!keywords || keywords.length === 0 || !text) return text;
  let highlighted = text;
  keywords.forEach(kw => {
    if (kw.trim()) {
      const regex = new RegExp(`(${kw.trim()})`, 'gi');
      highlighted = highlighted.replace(regex, '**$1**');
    }
  });
  return highlighted;
};

export const formatProjectName = (productName: string, pk: string) => {
  const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const cleanProduct = productName.trim() || 'منتج_غير_مسمى';
  const cleanPk = pk.trim() ? ` (${pk.trim()})` : '';
  return `SEO_${cleanProduct}${cleanPk}_${date}`.replace(/\s+/g, '_');
};


