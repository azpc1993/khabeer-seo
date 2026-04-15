'use client';

import dynamic from 'next/dynamic';

const CompetitorAnalysisClient = dynamic(() => import('./CompetitorAnalysisClient'), { ssr: false });

export default function CompetitorAnalysisPage() {
  return <CompetitorAnalysisClient />;
}
