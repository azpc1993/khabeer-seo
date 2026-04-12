import dynamic from 'next/dynamic';

const KeywordsClient = dynamic(() => import('./KeywordsClient'));

export const metadata = {
  title: 'البحث عن الكلمات المفتاحية | خبير السيو',
  description: 'أداة البحث عن الكلمات المفتاحية لمحتوى متوافق مع السيو.',
};

export default function KeywordsPage() {
  return <KeywordsClient />;
}
