'use client';

import { Movie } from '@/types';
import { MovieCard } from './movie-card';
import { Pagination } from '../ui/pagination';

import { PAGINATION_CONFIG } from '@/lib/config/pagination';

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  featuredIndex?: number[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function MovieGrid({
  movies,
  title,
  featuredIndex = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}: MovieGridProps) {
  if (isLoading) {
    return (
      <section className="py-6">
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {Array(PAGINATION_CONFIG.ITEMS_PER_PAGE / 2)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
            ))}
        </div>
      </section>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-xl font-semibold">Không tìm thấy phim nào</h2>
      </div>
    );
  }

  return (
    <section className="py-6">
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
      <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
        {movies.slice(0, PAGINATION_CONFIG.ITEMS_PER_PAGE).map((movie, index) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            variant={featuredIndex.includes(index) ? 'featured' : 'default'}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
