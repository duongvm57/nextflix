'use client';

import { useState } from 'react';
import { VideoPlayer } from '@/components/player/video-player';
import { EpisodeButton } from '@/components/player/episode-button';
import { playerConfig } from '@/lib/config/player';
import { MovieDetail, EpisodeItem } from '@/types';

interface MoviePlayerProps {
  movie: MovieDetail;
  initialEpisode?: EpisodeItem;
}

export function MoviePlayer({ movie, initialEpisode }: MoviePlayerProps) {
  // State for selected server and episode
  const [selectedServer, setSelectedServer] = useState<number>(0);
  // Get initial episode from either server_data or items
  const getInitialEpisode = () => {
    if (initialEpisode) return initialEpisode;
    if (movie.episodes?.[0]?.server_data?.[0]) return movie.episodes[0].server_data[0];
    return null;
  };

  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeItem | null>(getInitialEpisode());

  // Handle episode selection
  const handleEpisodeSelect = (episode: EpisodeItem) => {
    setSelectedEpisode(episode);
  };

  // Handle server selection
  const handleServerSelect = (serverIndex: number) => {
    // Store current episode name before changing server
    const currentEpisodeName = selectedEpisode?.name;

    // Get episodes from the new server (handle both server_data and items properties)
    const newServerEpisodes = movie.episodes[serverIndex]?.server_data || [];

    // Update selected server
    setSelectedServer(serverIndex);

    // If we have a current episode and episodes in the new server, try to find the same episode
    if (currentEpisodeName && newServerEpisodes.length > 0) {
      // Try to find the same episode in the new server
      const sameEpisodeInNewServer = newServerEpisodes.find(
        episode => episode.name === currentEpisodeName
      );

      if (sameEpisodeInNewServer) {
        // If found, select it
        setSelectedEpisode(sameEpisodeInNewServer);
      } else {
        // If not found, select the first episode in the new server
        setSelectedEpisode(newServerEpisodes[0]);
      }
    }
  };

  // If no episodes available
  if (!movie.episodes || movie.episodes.length === 0) {
    return (
      <div className="mb-8 text-center">
        <p className="text-gray-400">Không có tập phim nào khả dụng.</p>
      </div>
    );
  }

  // Get video source based on player config
  const videoSrc =
    playerConfig.defaultSourceType === 'm3u8'
      ? selectedEpisode?.link_m3u8 || ''
      : selectedEpisode?.link_embed || '';

  // Fallback to embed if m3u8 is not available
  const useEmbed = playerConfig.defaultSourceType === 'embed' || !selectedEpisode?.link_m3u8;

  return (
    <div className="mb-8">
      {/* Video Player */}
      <div className="mb-6">
        {useEmbed && videoSrc ? (
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-800">
            <iframe
              src={videoSrc}
              title={`${movie.name} - ${selectedEpisode?.name || ''}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            ></iframe>
          </div>
        ) : videoSrc ? (
          <div className="relative aspect-video overflow-hidden rounded-lg shadow-sm ring-1 ring-gray-800">
            <VideoPlayer src={videoSrc} poster={movie.thumb_url} className="rounded-lg" />
          </div>
        ) : (
          <div className="relative aspect-video flex items-center justify-center overflow-hidden rounded-lg bg-gray-800 shadow-sm ring-1 ring-gray-800">
            <p className="text-gray-400">Không có nguồn phát khả dụng</p>
          </div>
        )}
      </div>

      {/* Episode selection */}
      <div className="mb-6">
        <h3 className="mb-4 text-2xl font-semibold">Danh sách tập</h3>

        {/* Server tabs - optimized */}
        {movie.episodes.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {movie.episodes.map((server, index) => (
              <button
                key={index}
                className={`rounded-md px-4 py-2 ${selectedServer === index ? 'bg-primary text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                onClick={() => handleServerSelect(index)}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        )}

        {/* Episodes grid - optimized */}
        <div className="rounded-lg bg-gray-800 p-4">
          {/* Get episodes from the current server */}
          {(() => {
            const serverEpisodes = movie.episodes[selectedServer]?.server_data || [];

            if (serverEpisodes.length === 1 && serverEpisodes[0]?.name.toLowerCase() === 'full') {
              return (
                <EpisodeButton
                  key={0}
                  episode={serverEpisodes[0]}
                  isActive={true}
                  onClick={handleEpisodeSelect}
                  className="w-24"
                />
              );
            } else {
              return (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {serverEpisodes.map((episode, episodeIndex) => (
                    <EpisodeButton
                      key={episodeIndex}
                      episode={episode}
                      isActive={selectedEpisode?.name === episode.name}
                      onClick={handleEpisodeSelect}
                    />
                  ))}
                </div>
              );
            }
          })()
          }
        </div>
      </div>
    </div>
  );
}
