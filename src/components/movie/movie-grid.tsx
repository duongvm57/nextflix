'use client';

import { Movie } from '@/types';
import { MovieCard } from './movie-card';
import { Pagination } from '../ui/pagination';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { memo, useMemo } from 'react';

interface MovieGridProps {
  movies: Movie[];
  title?: string;
  featuredIndex?: number[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export const MovieGrid = memo(function MovieGrid({
  movies,
  title,
  featuredIndex = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
}: MovieGridProps) {
  // Memoize movies để tránh re-render không cần thiết
  const memoizedMovies = useMemo(() => movies, [movies]);

  // Memoize skeleton items để tránh tạo lại khi re-render
  const skeletonItems = useMemo(() => {
    if (!isLoading) return [];

    const skeletonCount = PAGINATION_CONFIG.ITEMS_PER_PAGE / 2;
    const items = [];

    for (let i = 0; i < skeletonCount; i++) {
      items.push(
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
      );
    }

    return items;
  }, [isLoading]);

  if (isLoading) {
    return (
      <section className="py-6">
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {skeletonItems}
        </div>
      </section>
    );
  }

  if (!memoizedMovies || memoizedMovies.length === 0) {
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
        {memoizedMovies.slice(0, PAGINATION_CONFIG.ITEMS_PER_PAGE).map((movie, index) => (
          <MovieCard
            key={movie._id}
            movie={movie}
            variant={featuredIndex.includes(index) ? 'featured' : 'default'}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="mt-8 flex justify-center"
        />
      )}
    </section>
  );
});

MovieGrid.displayName = 'MovieGrid';
