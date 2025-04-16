import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';

async function searchMovies(keyword: string) {
  try {
    return await movieService.searchMovies(keyword);
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { keyword?: string };
}) {
  const keyword = searchParams.keyword || '';
  const movies = keyword ? await searchMovies(keyword) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {keyword ? `Search Results for "${keyword}"` : 'Search Movies'}
      </h1>
      
      {keyword ? (
        movies.length > 0 ? (
          <MovieGrid movies={movies} />
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-xl text-gray-400">No movies found matching "{keyword}".</p>
          </div>
        )
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Enter a search term to find movies.</p>
        </div>
      )}
    </div>
  );
}
