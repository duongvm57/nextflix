'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tạo context để lưu trữ năm hiện tại
interface YearContextType {
  currentYear: number;
}

const YearContext = createContext<YearContextType>({ currentYear: new Date().getFullYear() });

// Hook để sử dụng context
export const useYear = () => useContext(YearContext);

// Provider component
export function YearProvider({ children }: { children: ReactNode }) {
  // Sử dụng useState với giá trị mặc định là năm hiện tại
  // Giá trị này sẽ được sử dụng cho cả server và client render
  const [currentYear] = useState(new Date().getFullYear());

  return <YearContext.Provider value={{ currentYear }}>{children}</YearContext.Provider>;
}
