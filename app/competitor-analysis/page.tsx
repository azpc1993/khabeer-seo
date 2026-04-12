import React from 'react';
import dynamic from 'next/dynamic';

const CompetitorAnalysisClient = dynamic(() => import('./CompetitorAnalysisClient'));

export const metadata = {
  title: 'تحليل المنافسين | خبير السيو',
  description: 'أداة تحليل المنافسين ومقارنة الأداء في محركات البحث.',
};

export default function CompetitorAnalysisPage() {
  return <CompetitorAnalysisClient />;
}
