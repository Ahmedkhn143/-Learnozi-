'use client';

import dynamic from 'next/dynamic';

const AppSPA = dynamic(() => import('@/src/AppSPA'), { ssr: false });

export default function CatchAllSPA() {
  return <AppSPA />;
}
