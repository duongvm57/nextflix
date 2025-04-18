'use client';

import { useEffect, useState } from 'react';
import { CacheStatus } from './cache-status';

export function CacheStatusWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <CacheStatus />;
}
