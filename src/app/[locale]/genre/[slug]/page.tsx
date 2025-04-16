import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { getTranslations, setRequestLocale } from 'next-intl/server';

async function getMoviesByGenre(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByGenre(slug, page);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return { data: [], pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 } };
  }
}

// Map of genre slugs to translation keys
const GENRE_TRANSLATION_KEYS: Record<string, string> = {
  'hanh-dong': 'genre.action',
  'phieu-luu': 'genre.adventure',
  'hoat-hinh': 'genre.animation',
  'hai-huoc': 'genre.comedy',
  'toi-pham': 'genre.crime',
  'tai-lieu': 'genre.documentary',
  'chinh-kich': 'genre.drama',
  'gia-dinh': 'genre.family',
  'vien-tuong': 'genre.fantasy',
  'lich-su': 'genre.history',
  'kinh-di': 'genre.horror',
  'am-nhac': 'genre.music',
  'bi-an': 'genre.mystery',
  'tinh-cam': 'genre.romance',
  'khoa-hoc-vien-tuong': 'genre.scienceFiction',
  'giat-gan': 'genre.thriller',
  'chien-tranh': 'genre.war',
  'cao-boi': 'genre.western',
};

export default async function GenrePage({
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
    const { slug } = params;
    const page = searchParams.page ? parseInt(searchParams.page) : 1;
    const { data: movies, pagination } = await getMoviesByGenre(slug, page);

    // Get genre name from translations if available
    const translationKey = GENRE_TRANSLATION_KEYS[slug];
    const genreName = translationKey
      ? t(translationKey)
      : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{genreName} {t('navigation.movies')}</h1>

        {movies.length > 0 ? (
          <>
            <MovieGrid movies={movies} />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                baseUrl={`/${locale}/genre/${slug}`}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-xl text-gray-400">{t('genre.noMoviesFound')}</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in GenrePage:', error);
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Genre</h1>
          <p className="mb-6">We're having trouble loading the genre. Please try again later.</p>
        </div>
      </div>
    );
  }
}
