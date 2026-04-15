'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PageClient = dynamic(() => import('./PageClient'), { ssr: false });

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageClient />
    </Suspense>
  );
}
