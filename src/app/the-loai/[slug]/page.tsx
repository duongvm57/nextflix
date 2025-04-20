import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getCategories } from '@/services/phimapi';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Category } from '@/types';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

// Sử dụng ISR thay vì force-static
export const revalidate = 3600; // revalidate mỗi 1 giờ

// Cache kết quả của các API calls
async function getMoviesByGenreWithCache(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByGenre(slug, page);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* @ts-expect-error Async Server Component */}
        <GenreContent slug={slug} page={page} />
      </Suspense>
    </div>
  );
}

async function GenreContent({ slug, page }: { slug: string; page: number }) {
  const [{ data: movies, pagination }, categories] = await Promise.all([
    getMoviesByGenreWithCache(slug, page),
    getCategories(),
  ]);

  if (pagination.totalPages > 0 && page > pagination.totalPages) {
    return Response.redirect(`/the-loai/${slug}?page=${pagination.totalPages}`);
  }

  const genre = (categories as Category[]).find(cat => cat.slug === slug);
  const genreName = genre
    ? genre.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <>
      <BreadcrumbSchema items={[{ name: genreName, url: `/the-loai/${slug}` }]} />
      <Breadcrumb items={[{ name: genreName, url: `/the-loai/${slug}` }]} className="mt-4" />
      <h1 className="mb-8 text-3xl font-bold">Thể loại: {genreName}</h1>

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
