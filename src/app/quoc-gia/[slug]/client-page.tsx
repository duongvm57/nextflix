'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { FilterButton } from '@/components/ui/filter-button';
import { Movie, PaginatedResponse } from '@/types';

interface CountryClientPageProps {
  initialData: {
    movies: Movie[];
    pagination: PaginatedResponse<Movie>['pagination'];
    countryName: string;
    slug: string;
  };
}

export function CountryClientPage({ initialData }: CountryClientPageProps) {
  const { movies, pagination, countryName, slug } = initialData;

  return (
    <>
      <Breadcrumb items={[{ name: countryName, url: `/quoc-gia/${slug}` }]} className="mt-4" />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Quốc gia: {countryName}</h1>
        <FilterButton baseUrl={`/quoc-gia/${slug}`} />
      </div>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/quoc-gia/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào từ quốc gia này.</p>
        </div>
      )}
    </>
  );
}
