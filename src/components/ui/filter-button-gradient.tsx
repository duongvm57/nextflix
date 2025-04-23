'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { FilterModal } from './filter-modal';
import { useSearchParams, usePathname } from 'next/navigation';

interface FilterButtonProps {
  baseUrl: string;
  className?: string;
}

export function FilterButtonGradient({ baseUrl, className = '' }: FilterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

    return filters;
  };

  return (
    <>
      <div className="relative">
        {/* Gradient border using pseudo-element */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#E50914]/30 opacity-75 blur-sm"></div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`relative flex items-center rounded-full bg-black px-4 py-2 text-white hover:bg-gray-900 ${className}`}
        >
          <Filter size={18} className="mr-2 text-[#E50914]" />
          <span>Bộ lọc</span>
          {activeFilters > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#E50914] text-xs">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        baseUrl={baseUrl}
        currentFilters={getCurrentFilters()}
        currentRoute={pathname}
      />
    </>
  );
}
