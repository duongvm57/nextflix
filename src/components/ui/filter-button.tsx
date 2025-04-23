'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { FilterModal } from './filter-modal';
import { useSearchParams, usePathname } from 'next/navigation';
import { useFilter } from '@/components/providers/filter-provider';

interface FilterButtonProps {
  baseUrl?: string;
  className?: string;
}

export function FilterButton({ baseUrl, className = '' }: FilterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Try to use FilterProvider if available
  let filterContext = null;
  try {
    filterContext = useFilter();
  } catch (error) {
    // Silently ignore - we'll use the fallback approach
  }

  // Use baseUrl from props or current pathname
  const effectiveBaseUrl = baseUrl || pathname || '/';

  // Count active filters
  useEffect(() => {
    if (!searchParams) return;

    let count = 0;

    // Exclude page parameter from filter count
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (key !== 'page') {
        count++;
      }
    }

    setActiveFilters(count);
  }, [searchParams]);

  // Get current filters as an object
  const getCurrentFilters = () => {
    if (!searchParams) return {};

    const filters: Record<string, string | string[]> = {};

    for (const [key, value] of Array.from(searchParams.entries())) {
      if (key !== 'page') {
        if (filters[key]) {
          // If this parameter already exists, convert to array
          if (Array.isArray(filters[key])) {
            (filters[key] as string[]).push(value);
          } else {
            filters[key] = [filters[key] as string, value];
          }
        } else {
          filters[key] = value;
        }
      }
    }

    console.log('FilterButton: Current filters from URL:', filters);
    return filters;
  };

  // Get current filters on each render to ensure we have the latest values
  const currentFilters = getCurrentFilters();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center rounded-full bg-gray-900 px-4 py-2 text-white hover:bg-black border border-gray-700 ${className}`}
      >
        <Filter size={18} className="mr-2 text-white" />
        <span className="text-white">Bộ lọc</span>
        {activeFilters > 0 && (
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-900 text-xs">
            {activeFilters}
          </span>
        )}
      </button>

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        baseUrl={effectiveBaseUrl}
        currentFilters={currentFilters}
        currentRoute={pathname}
      />
    </>
  );
}
