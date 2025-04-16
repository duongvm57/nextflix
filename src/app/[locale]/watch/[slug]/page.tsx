import { movieService } from '@/lib/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmbedClient } from './embed-client';
import { playerConfig } from '@/lib/config/player';

async function getMovieDetail(slug: string) {
  try {
    return await movieService.getMovieDetail(slug);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { episode?: string };
}) {
  try {
    // Await params and searchParams to avoid warnings
    const { locale, slug } = await Promise.resolve(params);
    const movie = await getMovieDetail(slug);

    // If movie doesn't exist, show error
    if (!movie) {
      return (
        <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
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

    // If movie has no episodes, use a default YouTube trailer
    if (!movie.episodes || movie.episodes.length === 0) {
      // Create a default episode with a YouTube trailer
      movie.episodes = [
        {
          _id: 'default',
          name: 'Trailer',
          slug: 'trailer',
          filename: `${movie.slug}-trailer`,
          link_embed: `https://www.youtube.com/embed/dQw4w9WgXcQ`, // Default video if none available
          link_m3u8: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
        }
      ];
    }

    // Get episode index from query params or default to first episode
    const { episode } = await Promise.resolve(searchParams);
    const episodeIndex = episode ? parseInt(episode) - 1 : 0;
    const currentEpisode = movie.episodes[episodeIndex] || movie.episodes[0];

    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href={`/${locale}/movie/${slug}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Movie
            </Button>
          </Link>
          <h1 className="text-xl font-bold md:text-2xl">{movie.name}</h1>
          {movie.episodes.length > 1 && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs">
              Episode {episodeIndex + 1}/{movie.episodes.length}
            </span>
          )}
        </div>

        {/* Video Player */}
        <div className="mb-8 w-full overflow-hidden rounded-lg bg-black">
          <div className="relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
            <div className="absolute inset-0">
              {/* Use client component for embed to avoid hydration issues */}
              <EmbedClient src={currentEpisode.link_embed} />
            </div>
          </div>
        </div>

        {/* Episodes List (if multiple episodes) */}
        {movie.episodes.length > 1 && (
          <div className="mb-4 sm:mb-8 rounded-lg bg-gray-800/50 p-3 sm:p-6">
            <h2 className="mb-4 text-xl font-bold">Episodes</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {movie.episodes.map((episode, index) => (
                <Link
                  key={episode._id}
                  href={`/${locale}/watch/${slug}?episode=${index + 1}`}
                  className={`flex items-center justify-center rounded-md p-3 text-center transition-colors ${
                    index === episodeIndex
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {episode.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Movie Info */}
        <div className="rounded-lg bg-gray-800/50 p-3 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">About {movie.name}</h2>
          <p className="text-gray-300">{movie.content}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in WatchPage:', error);
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Error Loading Video</h1>
          <p className="mb-6">We're having trouble loading the video. Please try again later.</p>
          <Link href={`/${locale}`}>
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
}
