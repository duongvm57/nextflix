import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { getCountries } from '@/services/phimapi';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { Country, PaginatedResponse, Movie } from '@/types';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

async function getMoviesByCountry(slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> {
  try {
    // Kiểm tra xem slug có phải là country slug hợp lệ không
    const countries = await getCountries();
    const isValidCountry = countries.some((country: Country) => country.slug === slug);

    if (!isValidCountry) {
      console.error(`Invalid country slug: ${slug}`);
      return {
        data: [],
        pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
      };
    }

    return await movieService.getMoviesByCountry(slug, page);
  } catch (error) {
    console.error('Error fetching movies by country:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

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

  // Get country name from API
  const countries = await getCountries();
  const country = countries.find((c: Country) => c.slug === slug);

  // Use country name from API or format from slug if not found
  const countryName = country
    ? country.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema items={[{ name: countryName, url: `/quoc-gia/${slug}` }]} />
      <Breadcrumb items={[{ name: countryName, url: `/quoc-gia/${slug}` }]} className="mt-4" />
      <h1 className="mb-8 text-3xl font-bold">Quốc gia: {countryName}</h1>

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
    </div>
  );
}
