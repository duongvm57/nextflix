import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MovieGrid } from '@/components/movie/movie-grid';
import { BackToTop } from '@/components/ui/back-to-top';
import { getMoviesByYearClientPaginated } from '@/services/phimapi';
import { SORT_FIELD, SORT_TYPE } from '@/lib/menu/phimapi-menu';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; year: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: `${params.year} | ${t('siteName')}`,
    description: t('yearDescription', { year: params.year }),
  };
}

export default async function YearPage({
  params,
  searchParams,
}: {
  params: { locale: string; year: string };
  searchParams: {
    page?: string;
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    country?: string;
  };
}) {
  const { locale, year } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // Get optional filter parameters
  const options = {
    sort_field: searchParams.sort_field || SORT_FIELD.MODIFIED_TIME,
    sort_type: searchParams.sort_type || SORT_TYPE.DESC,
    sort_lang: searchParams.sort_lang,
    category: searchParams.category,
    country: searchParams.country,
    limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
  };

  // Add debugging information
  console.log(`Fetching movies for year: ${year}, page: ${page}, options:`, options);

  try {
    // Get movies by year using the client-paginated function
    const { data: movies, pagination } = await getMoviesByYearClientPaginated(year, page, options);

    console.log(`Successfully fetched ${movies.length} movies for year ${year}`);
    console.log('Pagination:', pagination);

    if (movies.length > 0) {
      console.log('First movie:', movies[0]);
    }

    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold md:text-3xl">
            {locale === 'en' ? 'Movies from' : 'Phim năm'} {year}
          </h1>

          <MovieGrid movies={movies} pagination={pagination} baseUrl={`/${locale}/nam/${year}`} />
        </div>

        {/* Back to Top Button */}
        <BackToTop threshold={500} />
      </>
    );
  } catch (error) {
    console.error(`Error rendering year page for ${year}:`, error);

    // Return an error message
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl text-red-500">
          Error loading movies for year {year}
        </h1>
        <p className="text-gray-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
