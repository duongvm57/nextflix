import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { getCategories } from '@/services/phimapi';

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

async function getMoviesByYear(year: string, page: number = 1) {
  try {
    return await movieService.getMoviesByYear(year, page);
  } catch (error) {
    console.error('Error fetching movies by year:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Map of special category slugs to display names that might not be in the API
const SPECIAL_CATEGORY_NAMES: Record<string, string> = {
  'phim-le': 'Phim lẻ',
  'phim-bo': 'Phim bộ',
  'hoat-hinh': 'Hoạt hình',
  'phim-vietsub': 'Phim Vietsub',
  'phim-thuyet-minh': 'Phim Thuyết minh',
  'phim-long-tieng': 'Phim Lồng tiếng',
  'tv-shows': 'TV Shows',
};

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // Check if slug is a year (4 digits)
  const isYear = /^\d{4}$/.test(slug);

  let movies;
  let pagination;
  let title;

  if (isYear) {
    // Get movies by year
    const result = await getMoviesByYear(slug, page);
    movies = result.data;
    pagination = result.pagination;
    title = `Phim năm ${slug}`;
  } else {
    // Get movies by category
    const result = await getMoviesByCategory(slug, page);
    movies = result.data;
    pagination = result.pagination;

    // First check if it's a special category
    if (SPECIAL_CATEGORY_NAMES[slug]) {
      title = SPECIAL_CATEGORY_NAMES[slug];
    } else {
      // Try to get category name from API
      const categories = await getCategories();
      const category = categories.find(cat => cat.slug === slug);

      // Use category name from API or format from slug if not found
      title = category
        ? category.name
        : slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/categories/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào.</p>
        </div>
      )}
    </div>
  );
}
