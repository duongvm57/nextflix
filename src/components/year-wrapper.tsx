'use client';

import { YearProvider } from '@/providers/year-provider';
import { ReactNode } from 'react';

// Wrapper component để sử dụng YearProvider trong Server Components
export function YearWrapper({ children }: { children: ReactNode }) {
  return <YearProvider>{children}</YearProvider>;
}
