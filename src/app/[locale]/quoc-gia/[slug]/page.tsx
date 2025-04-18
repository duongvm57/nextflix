import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MovieCard } from '@/components/movie/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { BackToTop } from '@/components/ui/back-to-top';
import { getMoviesByCountry, getCountries } from '@/services/phimapi';
import { SORT_FIELD, SORT_TYPE } from '@/lib/menu/phimapi-menu';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { page?: string };
}): Promise<Metadata> {
  // Await params to avoid warnings
  const { locale, slug } = await Promise.resolve(params);
  const { page: pageParam } = await Promise.resolve(searchParams);
  const page = pageParam ? parseInt(pageParam) : 1;

  // Use hardcoded values instead of translations for now
  const siteName = 'NextFlix';

  // Fetch countries from API
  let countryName;
  try {
    const countries = await getCountries();
    // Find the country with matching slug
    const country = countries.find(c => c.slug === slug);

    if (country) {
      // Use the name from the API
      countryName = country.name;
    } else {
      // Fallback to capitalized slug if country not found
      countryName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  } catch (error) {
    console.error('Error fetching countries for metadata:', error);
    // Fallback to capitalized slug if API call fails
    countryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Create title
  const title = locale === 'en' ? `Movies from ${countryName}` : `Phim ${countryName}`;

  // Add page number to title if not on first page
  const pageTitle = page > 1 ? `${title} - ${locale === 'en' ? 'Page' : 'Trang'} ${page}` : title;

  return {
    title: `${pageTitle} | ${siteName}`,
    description:
      locale === 'en'
        ? `Browse our collection of movies from ${countryName}`
        : `Duyệt bộ sưu tập phim ${countryName} của chúng tôi`,
  };
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: {
    page?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    year?: string;
  };
}) {
  // Await params and searchParams to avoid warnings
  const { locale, slug } = await Promise.resolve(params);
  const {
    page: pageParam,
    sort_field,
    sort_type,
    sort_lang,
    category,
    year,
  } = await Promise.resolve(searchParams);
  const page = pageParam ? parseInt(pageParam) : 1;

  // Get optional filter parameters
  const options = {
    sort_field: sort_field || SORT_FIELD.MODIFIED_TIME,
    sort_type: sort_type || SORT_TYPE.DESC,
    sort_lang,
    category,
    year,
    limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
  };

  console.log(`Fetching movies for country: ${slug}, page: ${page}, options:`, options);

  try {
    console.log(`[DEBUG] Country page - Fetching movies for country: ${slug}, page: ${page}`);

    // Get movies by country using the correct API endpoint
    const result = await getMoviesByCountry(slug, page, options);
    console.log(`[DEBUG] Country page - Result pagination:`, result.pagination);
    console.log(`[DEBUG] Country page - Result data length:`, result.data?.length || 0);

    // Check if we have a valid result
    if (!result || !result.data) {
      console.error(`[DEBUG] Country page - Invalid result for country: ${slug}`);
      throw new Error('Invalid API response');
    }

    const { data: movies, pagination } = result;

    // Check if we have movies
    if (!movies || movies.length === 0) {
      console.log(`[DEBUG] Country page - No movies found for country: ${slug}`);
    } else {
      console.log(`[DEBUG] Country page - Found ${movies.length} movies for country: ${slug}`);
      if (movies.length > 0) {
        console.log(`[DEBUG] Country page - First movie:`, {
          id: movies[0]._id,
          name: movies[0].name,
          slug: movies[0].slug,
          thumb_url: movies[0].thumb_url,
        });
      }
    }

    // Fetch country name from API
    let countryName;
    try {
      const countries = await getCountries();
      // Find the country with matching slug
      const country = countries.find(c => c.slug === slug);

      if (country) {
        // Use the name from the API
        countryName = country.name;
      } else {
        // Fallback to capitalized slug if country not found
        countryName = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      // Fallback to capitalized slug if API call fails
      countryName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Create title
    const title = locale === 'en' ? `Movies from ${countryName}` : `Phim ${countryName}`;

    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold md:text-3xl">{title}</h1>

          {movies && movies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {movies.map(movie => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-xl text-gray-400">
                {locale === 'en'
                  ? 'No movies found from this country'
                  : 'Không tìm thấy phim từ quốc gia này'}
              </p>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                baseUrl={`/${locale}/quoc-gia/${slug}`}
              />
            </div>
          )}
        </div>

        {/* Back to Top Button */}
        <BackToTop threshold={500} />
      </>
    );
  } catch (error) {
    console.error(`Error rendering country page for ${slug}:`, error);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl text-red-500">
          Error loading movies for country
        </h1>
        <p className="text-gray-400 mb-4">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }
}
