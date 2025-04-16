import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { getTranslations } from 'next-intl/server';

async function getMoviesByGenre(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByGenre(slug, page);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return { data: [], pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 } };
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const t = await getTranslations('genre');
  const commonT = await getTranslations('common');
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = await getMoviesByGenre(slug, page);

  // Format genre name from slug
  const genreName = t(slug as any) || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{genreName} {commonT('movies')}</h1>
      
      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.currentPage} 
              totalPages={pagination.totalPages} 
              baseUrl={`/genre/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">{t('noMoviesFound')}</p>
        </div>
      )}
    </div>
  );
}
