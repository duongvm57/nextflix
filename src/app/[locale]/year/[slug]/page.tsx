import { getMoviesByYear } from '@/services/phimapi';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { getTranslations, setRequestLocale } from 'next-intl/server';

// getMoviesByYear is imported from phimapi.ts

export default async function YearPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { page?: string };
}) {
  try {
    // Enable static rendering
    const locale = params.locale;
    setRequestLocale(locale);

    const t = await getTranslations();
    const { slug: year } = params;
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const { data: movies, pagination } = await getMoviesByYear(year, page);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t('year.moviesFromYear', { year })}</h1>

        {movies.length > 0 ? (
          <>
            <MovieGrid movies={movies} />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                baseUrl={`/${locale}/year/${year}`}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-xl text-gray-400">{t('year.noMoviesFound')}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in YearPage:', error);
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Year</h1>
          <p className="mb-6">We're having trouble loading the year. Please try again later.</p>
        </div>
      </div>
    );
  }
}
