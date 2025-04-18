import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';

async function getMoviesByCountry(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByCountry(slug, page);
  } catch (error) {
    console.error('Error fetching movies by country:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Map of country slugs to display names
const COUNTRY_NAMES: Record<string, string> = {
  'au-my': 'American',
  'trung-quoc': 'Chinese',
  'han-quoc': 'Korean',
  'nhat-ban': 'Japanese',
  'thai-lan': 'Thai',
  'hong-kong': 'Hong Kong',
  'viet-nam': 'Vietnamese',
  'dai-loan': 'Taiwan',
  'an-do': 'Indian',
  anh: 'British',
  phap: 'French',
  canada: 'Canadian',
  'quoc-gia-khac': 'Other',
};

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = await getMoviesByCountry(slug, page);

  // Get country display name or use formatted slug if not found
  const countryName =
    COUNTRY_NAMES[slug] ||
    slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{countryName} Movies</h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/country/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">No movies found from this country.</p>
        </div>
      )}
    </div>
  );
}
