import dynamic from 'next/dynamic';

const KeywordGapClient = dynamic(() => import('./KeywordGapClient'));

export const metadata = {
  title: 'Keyword Gap Tool | أداة تحليل الفجوة',
  description: 'مقارنة صفحة المستخدم مع صفحة المنافس لاكتشاف الكلمات المفتاحية المفقودة والفرص.',
};

export default function KeywordGapPage() {
  return <KeywordGapClient />;
}
