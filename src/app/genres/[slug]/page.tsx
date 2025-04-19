import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getCategories } from '@/services/phimapi';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';

async function getMoviesByGenre(slug: string, page: number = 1) {
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
  const { data: movies, pagination } = await getMoviesByGenre(slug, page);

  // Redirect to the last page if current page is greater than total pages
  if (pagination.totalPages > 0 && page > pagination.totalPages) {
    return Response.redirect(`/genres/${slug}?page=${pagination.totalPages}`);
  }

  // Get genre name from API
  const categories = await getCategories();
  const genre = categories.find(cat => cat.slug === slug);

  // Use genre name from API or format from slug if not found
  const genreName = genre
    ? genre.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema
        items={[
          { name: genreName, url: `/genres/${slug}` },
        ]}
      />
      <Breadcrumb
        items={[
          { name: genreName, url: `/genres/${slug}` },
        ]}
        className="mt-4"
      />
      <h1 className="mb-8 text-3xl font-bold">Thể loại: {genreName}</h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/genres/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào trong thể loại này.</p>
        </div>
      )}
    </div>
  );
}
