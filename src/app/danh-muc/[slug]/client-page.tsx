'use client';

import { Breadcrumb } from '@/components/ui/breadcrumb';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Movie, PaginatedResponse } from '@/types';

interface CategoryClientPageProps {
  initialData: {
    movies: Movie[];
    pagination: PaginatedResponse<Movie>['pagination'];
    title: string;
    slug: string;
  };
  isYear: boolean;
}

export function CategoryClientPage({ initialData, isYear }: CategoryClientPageProps) {
  const { movies, pagination, title, slug } = initialData;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[{ name: title, url: `/danh-muc/${slug}` }]}
        className="mt-4"
      />
      <h1 className="mb-8 text-3xl font-bold">
        {isYear ? `Phim năm ${slug}` : title}
      </h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/danh-muc/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">
            {isYear
              ? `Không tìm thấy phim nào trong năm ${slug}.`
              : `Không tìm thấy phim nào trong danh mục này.`}
          </p>
        </div>
      )}
    </div>
  );
}
