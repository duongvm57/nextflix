import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';

async function getMoviesByCategory(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByCategory(slug, page);
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Map of category slugs to display names
const CATEGORY_NAMES: Record<string, string> = {
  'phim-le': 'Movies',
  'phim-bo': 'TV Series',
  'hoat-hinh': 'Anime',
  'phim-dang-chieu': 'Now Showing',
  'phim-sap-chieu': 'Coming Soon',
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = await getMoviesByCategory(slug, page);

  // Get category display name or use slug if not found
  const categoryName =
    CATEGORY_NAMES[slug] ||
    slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{categoryName}</h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/category/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">No movies found in this category.</p>
        </div>
      )}
    </div>
  );
}
