import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MovieGrid } from '@/components/movie/movie-grid';
import { getNewMovies } from '@/services/phimapi';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // Await params to avoid warnings
  const { locale } = await Promise.resolve(params);

  // Use hardcoded values instead of translations for now
  const title = locale === 'en' ? 'New Movies' : 'Phim Mới';
  const siteName = 'NextFlix';
  const description =
    locale === 'en'
      ? 'Latest movies and TV shows added to our collection'
      : 'Phim và chương trình truyền hình mới nhất được thêm vào bộ sưu tập của chúng tôi';

  return {
    title: `${title} | ${siteName}`,
    description,
  };
}

export default async function NewMoviesPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string };
}) {
  // Await params and searchParams to avoid warnings
  const { locale } = await Promise.resolve(params);
  const { page: pageParam } = await Promise.resolve(searchParams);
  const page = pageParam ? parseInt(pageParam) : 1;

  // Get new movies
  const { data: movies, pagination } = await getNewMovies(page);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">
        {locale === 'en' ? 'New Movies' : 'Phim mới cập nhật'}
      </h1>

      <MovieGrid movies={movies} pagination={pagination} baseUrl={`/${locale}/new-movies`} />
    </div>
  );
}
