// services/seoAnalyzer.ts

export type Priority = 'High' | 'Medium' | 'Low';

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  impact: string;
  fix: string;
  priority: Priority;
  actionType: 'optimize_desc' | 'generate_alt' | 'suggest_h1' | 'keyword_fix';
}

export interface SeoMetrics {
  score: number;
  wordCount: number;
  imagesCount: number;
  imagesWithoutAlt: number;
  hasH1: boolean;
  hasMetaDescription: boolean;
  h2Count?: number;
  extractedTexts?: {
    title: string;
    metaDescription: string;
    h1: string;
    h2s: string[];
    firstParagraph: string;
  };
  keywords: {
    primary: string[];
    lsi: string[];
    missing: string[];
  };
  recommendations: Recommendation[];
}

/**
 * وظيفة تحليل الرابط وجلب بيانات السيو الفعلية
 */
export const analyzeUrlSEO = async (url: string): Promise<SeoMetrics> => {
  const response = await fetch('/api/analyze-seo', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, timestamp: Date.now() }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze URL');
  }

  return response.json();
};
