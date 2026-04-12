import dynamic from 'next/dynamic';

const PageClient = dynamic(() => import('./PageClient'));

export default function Page() {
  return <PageClient />;
}
