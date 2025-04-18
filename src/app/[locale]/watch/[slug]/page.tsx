import { getMovieDetail } from '@/services/phimapi';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EmbedClient } from './embed-client';

// getMovieDetail is imported from phimapi.ts

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: { locale: string; slug: string };
  searchParams: { episode?: string; server?: string };
}) {
  try {
    // Await params and searchParams to avoid warnings
    const { locale, slug } = await Promise.resolve(params);
    console.log(`WatchPage: Fetching movie details for slug: ${slug}`);
    const movie = await getMovieDetail(slug);
    console.log(`WatchPage: Movie fetched successfully:`, movie ? 'yes' : 'no');

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
      console.log('WatchPage: No episodes found, using default trailer');
      // Create a default episode with a YouTube trailer
      movie.episodes = [
        {
          server_name: 'Default',
          items: [
            {
              name: 'Trailer',
              slug: 'trailer',
              filename: `${movie.slug}-trailer`,
              link_embed: `https://www.youtube.com/embed/dQw4w9WgXcQ`, // Default video if none available
              link_m3u8: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
            }
          ]
        }
      ];
    } else {
      console.log(`WatchPage: Found ${movie.episodes.length} servers with episodes`);
      movie.episodes.forEach((server, index) => {
        console.log(`WatchPage: Server ${index + 1}: ${server.server_name} with ${server.items.length} episodes`);
        if (server.items.length > 0) {
          console.log(`WatchPage: First episode link_embed: ${server.items[0].link_embed}`);
        }
      });
    }

    // Get server and episode index from query params or default to first server and episode
    const { episode, server } = await Promise.resolve(searchParams);
    const serverIndex = server ? parseInt(server) - 1 : 0;
    const selectedServer = movie.episodes[serverIndex] || movie.episodes[0];

    // Get episode index
    const episodeIndex = episode ? parseInt(episode) - 1 : 0;
    const currentEpisode = selectedServer.items[episodeIndex] || selectedServer.items[0];

    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href={`/${locale}/movie/${slug}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Quay lại phim
            </Button>
          </Link>
          <h1 className="text-xl font-bold md:text-2xl">{movie.name}</h1>
          {selectedServer.items.length > 1 && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs">
              {selectedServer.server_name}: {currentEpisode.name} ({episodeIndex + 1}/{selectedServer.items.length})
            </span>
          )}
        </div>

        {/* Trình phát video */}
        <div className="mb-8 w-full overflow-hidden rounded-lg bg-black">
          <div className="relative" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
            <div className="absolute inset-0">
              {/* Use client component for embed to avoid hydration issues */}
              <EmbedClient src={currentEpisode.link_embed} />
            </div>
          </div>
        </div>

        {/* Server and Episodes Section */}
        {movie.episodes.length > 0 && (
          <div className="mb-4 sm:mb-8 rounded-lg bg-gray-800/50 p-3 sm:p-6">
            {movie.episodes.length > 1 && (
              <>
                <h2 className="mb-4 text-xl font-bold">Máy chủ</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4">
                  {movie.episodes.map((server, index) => (
                    <Link
                      key={`server-${index}`}
                      href={`/${locale}/watch/${slug}?server=${index + 1}`}
                      className={`flex items-center justify-center rounded-md p-3 text-center transition-colors ${
                        index === serverIndex
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {server.server_name}
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Danh sách tập phim */}
            {selectedServer.items.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold">Danh sách tập</h2>
                <div className="grid grid-cols-8 gap-2 md:gap-3">
                  {selectedServer.items.map((item, index) => (
                    <Link
                      key={`episode-${index}`}
                      href={`/${locale}/watch/${slug}?server=${serverIndex + 1}&episode=${index + 1}`}
                      className={`flex items-center justify-center rounded py-2 text-center transition-colors ${
                        index === episodeIndex
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Giới thiệu phim */}
        <div className="rounded-lg bg-gray-800/50 p-3 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">Giới thiệu {movie.name}</h2>
          <p className="text-gray-300">{movie.content}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in WatchPage:', error);
    // Get locale from params to avoid error
    const { locale } = params;
    return (
      <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Lỗi tải video</h1>
          <p className="mb-6">Chúng tôi đang gặp sự cố khi tải video. Vui lòng thử lại sau.</p>
          <Link href={`/${locale}`}>
            <Button variant="primary">Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }
}
