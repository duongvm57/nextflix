'use client';

import { useYear } from '@/providers/year-provider';

// Component để hiển thị năm hiện tại
export function YearDisplay() {
  const { currentYear } = useYear();
  return <>{currentYear}</>;
}

// Component để tạo danh sách năm
export function YearsList({ length = 5 }: { length?: number }) {
  const { currentYear } = useYear();
  
  return (
    <>
      {Array.from({ length }, (_, i) => {
        const year = currentYear - i;
        return (
          <div key={year}>{year}</div>
        );
      })}
    </>
  );
}
