'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/recipes');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Redirection...</p>
    </div>
  );
}
