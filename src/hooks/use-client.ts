// src/hooks/use-client.ts
'use client';

import { useEffect, useState } from 'react';

export function useClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []); // Empty dependency array ensures this runs once on mount

  return isClient;
}
