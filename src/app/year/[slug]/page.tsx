import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';

async function getMoviesByYear(year: string, page: number = 1) {
  try {
    return await movieService.getMoviesByYear(year, page);
  } catch (error) {
    console.error('Error fetching movies by year:', error);
    return { data: [], pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 } };
  }
}

export default async function YearPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug: year } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = await getMoviesByYear(year, page);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Movies from {year}</h1>
      
      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />
          
          {pagination && pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.currentPage} 
              totalPages={pagination.totalPages} 
              baseUrl={`/year/${year}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">No movies found from this year.</p>
        </div>
      )}
    </div>
  );
}
