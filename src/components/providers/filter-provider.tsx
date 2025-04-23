'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMovieFilter } from '@/hooks/useMovieFilter';
import { ApiParams } from '@/lib/api/client';
import { Movie, PaginatedResponse } from '@/types';

// Định nghĩa kiểu dữ liệu cho context
interface FilterContextType {
  movies: Movie[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  applyFilters: (filters: Partial<ApiParams>, updateUrl?: boolean) => void;
  changePage: (page: number) => void;
  getRouteInfo: () => { routeType: string; routeSlug: string };
}

// Tạo context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Props cho FilterProvider
interface FilterProviderProps {
  children: ReactNode;
  initialData?: PaginatedResponse<Movie>;
}

// Provider component
export function FilterProvider({ children, initialData }: FilterProviderProps) {
  const filterHook = useMovieFilter(initialData);
  
  return (
    <FilterContext.Provider value={filterHook}>
      {children}
    </FilterContext.Provider>
  );
}

// Hook để sử dụng context
export function useFilter() {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  
  return context;
}
