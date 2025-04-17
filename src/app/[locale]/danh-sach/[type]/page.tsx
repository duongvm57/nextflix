import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MovieCard } from '@/components/movie/movie-card';
import { Pagination } from '@/components/ui/pagination';
import { BackToTop } from '@/components/ui/back-to-top';
import { getMoviesByCategoryClientPaginated } from '@/services/phimapi';
import { TYPE_LIST } from '@/lib/menu/phimapi-menu';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { locale: string; type: string };
  searchParams: { page?: string };
}): Promise<Metadata> {
  // Await params to avoid warnings
  const { locale, type } = await Promise.resolve(params);
  const { page: pageParam } = await Promise.resolve(searchParams);
  const page = pageParam ? parseInt(pageParam) : 1;

  // Use hardcoded values instead of translations for now
  const siteName = 'NextFlix';

  // Check if type is a year (4 digits)
  const isYear = /^\d{4}$/.test(type);

  // Get title based on type
  let title = '';

  if (isYear) {
    title = locale === 'en' ? `Movies from ${type}` : `Phim năm ${type}`;
  } else {
    switch (type) {
      case TYPE_LIST.PHIM_BO:
        title = locale === 'en' ? 'TV Series' : 'Phim bộ';
        break;
      case TYPE_LIST.PHIM_LE:
        title = locale === 'en' ? 'Movies' : 'Phim lẻ';
        break;
      case TYPE_LIST.TV_SHOWS:
        title = 'TV Shows';
        break;
      case TYPE_LIST.HOAT_HINH:
        title = locale === 'en' ? 'Animation' : 'Hoạt hình';
        break;
      case TYPE_LIST.PHIM_VIETSUB:
        title = 'Phim Vietsub';
        break;
      case TYPE_LIST.PHIM_THUYET_MINH:
        title = locale === 'en' ? 'Dubbed Movies' : 'Phim Thuyết Minh';
        break;
      case TYPE_LIST.PHIM_LONG_TIENG:
        title = locale === 'en' ? 'Voice Over Movies' : 'Phim Lồng Tiếng';
        break;
      default:
        title = locale === 'en' ? 'Movies' : 'Phim';
    }
  }

  // Create description
  const description = locale === 'en'
    ? `Browse our collection of ${title}`
    : `Duyệt bộ sưu tập ${title} của chúng tôi`;

  // Add page number to title if not on first page
  const pageTitle = page > 1 ? `${title} - ${locale === 'en' ? 'Page' : 'Trang'} ${page}` : title;

  return {
    title: `${pageTitle} | ${siteName}`,
    description,
  };
}

export default async function MovieListPage({
  params,
  searchParams,
}: {
  params: { locale: string; type: string };
  searchParams: { page?: string; category?: string; country?: string };
}) {
  // Await params and searchParams to avoid warnings
  const { locale, type } = await Promise.resolve(params);
  const { page: pageParam, category, country } = await Promise.resolve(searchParams);
  const page = pageParam ? parseInt(pageParam) : 1;

  // Prepare options for API call
  const options: {
    sort_field?: string;
    sort_type?: string;
    category?: string;
    country?: string;
  } = {
    sort_field: 'modified.time',
    sort_type: 'desc'
  };

  // Add category and country parameters if provided
  if (category) {
    options.category = category;
  }

  if (country) {
    options.country = country;
  }

  console.log(`Fetching movies for type: ${type}, page: ${page}, options:`, options);

  try {
    // Get movies by type (including year, category, etc.)
    // We'll use getMoviesByCategoryClientPaginated for all types since it now handles years correctly
    const { data: movies, pagination } = await getMoviesByCategoryClientPaginated(type, page, options);

  // Get title based on type
  let title = '';

  // Check if type is a year (4 digits)
  const isYear = /^\d{4}$/.test(type);

  if (isYear) {
    title = locale === 'en' ? `Movies from ${type}` : `Phim năm ${type}`;
  } else {
    switch (type) {
      case TYPE_LIST.PHIM_BO:
        title = locale === 'en' ? 'TV Series' : 'Phim bộ';
        break;
      case TYPE_LIST.PHIM_LE:
        title = locale === 'en' ? 'Movies' : 'Phim lẻ';
        break;
      case TYPE_LIST.TV_SHOWS:
        title = 'TV Shows';
        break;
      case TYPE_LIST.HOAT_HINH:
        title = locale === 'en' ? 'Animation' : 'Hoạt hình';
        break;
      case TYPE_LIST.PHIM_VIETSUB:
        title = 'Phim Vietsub';
        break;
      case TYPE_LIST.PHIM_THUYET_MINH:
        title = locale === 'en' ? 'Dubbed Movies' : 'Phim Thuyết Minh';
        break;
      case TYPE_LIST.PHIM_LONG_TIENG:
        title = locale === 'en' ? 'Voice Over Movies' : 'Phim Lồng Tiếng';
        break;
      default:
        title = locale === 'en' ? 'Movies' : 'Phim';
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">{title}</h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
            />
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/${locale}/danh-sach/${type}`}
            />
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <BackToTop threshold={500} />
    </>
  );
  } catch (error) {
    console.error(`Error rendering page for type/year ${type}:`, error);

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl text-red-500">
          Error loading content
        </h1>
        <p className="text-gray-400">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}
