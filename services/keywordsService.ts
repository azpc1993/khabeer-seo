export interface PrimaryKeyword {
  keyword: string;
  volume: string;
  cpc: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trend: 'up' | 'stable' | 'down';
}

export interface KeywordSearchResponse {
  pks: PrimaryKeyword[];
  lsi: string[];
  intent: string;
}

export const searchKeywords = async (query: string): Promise<KeywordSearchResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate potential error
  if (query.toLowerCase() === 'error') {
    throw new Error('Failed to fetch keywords');
  }

  // Simulate empty results
  if (query.toLowerCase() === 'empty') {
    return { pks: [], lsi: [], intent: 'لا توجد نتائج لهذه الكلمة.' };
  }

  // Mock successful response
  return {
    pks: [
      { keyword: 'هدايا مواليد السعودية', volume: '8,500', cpc: '3.2 ر.س', difficulty: 'Medium', trend: 'up' },
      { keyword: 'تنسيق هدايا مواليد 2026', volume: '3,200', cpc: '2.8 ر.س', difficulty: 'Easy', trend: 'up' },
    ],
    lsi: ['توزيعات مواليد مميزة', 'مستلزمات مواليد حديثي الولادة', 'أفكار هدايا مواليد 2026'],
    intent: 'تتنوع نية البحث بين التجاري (Transactional) حيث يرغب المستخدم في شراء هدايا جاهزة...'
  };
};
