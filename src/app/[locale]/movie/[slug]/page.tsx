import Image from 'next/image';
import { getMovieDetail } from '@/services/phimapi';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Clock, Globe, Film } from 'lucide-react';
import Link from 'next/link';

// getMovieDetail is imported from phimapi.ts

export default async function MovieDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  try {
    // Await params to avoid warnings
    const { locale, slug } = await Promise.resolve(params);
    const movie = await getMovieDetail(slug);

    if (!movie) {
      return (
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Movie Not Found</h1>
            <p className="mb-6">The movie you are looking for might have been removed or is temporarily unavailable.</p>
            <Link href={`/${locale}`}>
              <Button variant="primary">Back to Home</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
      {/* Movie Hero Section */}
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={movie.poster_url || movie.thumb_url}
            alt={movie.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 p-6 md:p-12">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl lg:text-5xl">{movie.name}</h1>
          <p className="mb-4 text-gray-300">{movie.origin_name}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {movie.category && (
              <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                {movie.category.name}
              </span>
            )}
            {movie.quality && (
              <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                {movie.quality}
              </span>
            )}
            {movie.year && (
              <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                {movie.year}
              </span>
            )}
          </div>

          {/* Watch Button */}
          <div className="mt-6">
            <Link href={`/${locale}/watch/${movie.slug}`}>
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <Play size={20} fill="white" />
                Watch Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Movie Info Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column - Movie Details */}
        <div className="md:col-span-2">
          <div className="mb-8 rounded-lg bg-gray-800/50 p-6">
            <h2 className="mb-4 text-2xl font-bold">About Movie</h2>
            <p className="text-gray-300">{movie.content}</p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm text-gray-300">Year: {movie.year}</span>
              </div>

              {movie.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-300">Duration: {movie.duration}</span>
                </div>
              )}

              {movie.country && movie.country.length > 0 && (
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Country: {movie.country.map(c => c.name).join(', ')}
                  </span>
                </div>
              )}

              {movie.status && (
                <div className="flex items-center gap-2">
                  <Film size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-300">Status: {movie.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Episodes Section */}
          {movie.episodes && movie.episodes.length > 0 && (
            <div className="mb-8 rounded-lg bg-gray-800/50 p-6">
              <h2 className="mb-4 text-2xl font-bold">Episodes</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {movie.episodes.map((episode, index) => (
                  <Link
                    key={episode._id}
                    href={`/${locale}/watch/${movie.slug}?episode=${index + 1}`}
                    className="flex items-center justify-center rounded-md bg-gray-700 p-3 text-center transition-colors hover:bg-primary"
                  >
                    {episode.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div>
          {/* Movie Poster */}
          <div className="mb-6 overflow-hidden rounded-lg">
            <Image
              src={movie.thumb_url}
              alt={movie.name}
              width={300}
              height={450}
              className="w-full"
            />
          </div>

          {/* Movie Info */}
          <div className="rounded-lg bg-gray-800/50 p-6">
            <h3 className="mb-4 text-xl font-bold">Movie Info</h3>

            <div className="space-y-4">
              {movie.view && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Views:</span>
                  <span>{movie.view.toLocaleString()}</span>
                </div>
              )}

              {movie.quality && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Quality:</span>
                  <span>{movie.quality}</span>
                </div>
              )}

              {movie.lang && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span>{movie.lang}</span>
                </div>
              )}

              {movie.episode_current && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current Episode:</span>
                  <span>{movie.episode_current}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-lg font-semibold">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Link
                      key={genre.slug}
                      href={`/${locale}/genre/${genre.slug}`}
                      className="rounded-full bg-gray-700 px-3 py-1 text-sm transition-colors hover:bg-primary"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actors */}
            {movie.actors && movie.actors.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-lg font-semibold">Actors</h4>
                <p className="text-sm text-gray-300">{movie.actors.join(', ')}</p>
              </div>
            )}

            {/* Directors */}
            {movie.directors && movie.directors.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-lg font-semibold">Directors</h4>
                <p className="text-sm text-gray-300">{movie.directors.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    );
  } catch (error) {
    console.error('Error in MovieDetailPage:', error);
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Movie</h1>
          <p className="mb-6">We're having trouble loading the movie details. Please try again later.</p>
          <Link href={`/${locale}`}>
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
}
