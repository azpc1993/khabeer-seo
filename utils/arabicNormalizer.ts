export function normalizeArabicSeoTerms(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') return text || '';
  
  let normalized = text;
  
  // “سلسل” ← “سلسال”
  normalized = normalized.replace(/\bسلسل\b/g, 'سلسال');
  
  // “وقليل” / “وقالب” ← “وقلب”
  normalized = normalized.replace(/\b(وقليل|وقالب)\b/g, 'وقلب');
  
  // “محوريات” ← “مجوهرات”
  normalized = normalized.replace(/\bمحوريات\b/g, 'مجوهرات');
  
  // “مطابقة بالأذهب” ← “مطلي بالذهب”
  normalized = normalized.replace(/\bمطابقة بالأذهب\b/g, 'مطلي بالذهب');
  
  // “تواليد” ← “توليد”
  normalized = normalized.replace(/\bتواليد\b/g, 'توليد');
  
  // “استغلال” ← “المنافسة” أو “حجم الإعلانات” حسب السياق
  normalized = normalized.replace(/\bاستغلال\b/g, 'المنافسة');
  
  // “الإعانات” ← “الأدوات”
  normalized = normalized.replace(/\bالإعانات\b/g, 'الأدوات');
  
  // “الأحوال” ← “الأدوات”
  normalized = normalized.replace(/\bالأحوال\b/g, 'الأدوات');
  
  return normalized;
}
