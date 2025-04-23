'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { FilterButton } from '@/components/ui/filter-button';
import { Movie, PaginatedResponse } from '@/types';

interface GenreClientPageProps {
  initialData: {
    movies: Movie[];
    pagination: PaginatedResponse<Movie>['pagination'];
    genreName: string;
    slug: string;
  };
}

export function GenreClientPage({ initialData }: GenreClientPageProps) {
  const { movies, pagination, genreName, slug } = initialData;

  return (
    <>
      <Breadcrumb items={[{ name: genreName, url: `/the-loai/${slug}` }]} className="mt-4" />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Thể loại: {genreName}</h1>
        <FilterButton baseUrl={`/the-loai/${slug}`} />
      </div>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/the-loai/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào trong thể loại này.</p>
        </div>
      )}
    </>
  );
}
