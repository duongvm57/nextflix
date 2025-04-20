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
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeItem | null>(
    initialEpisode || movie.episodes?.[0]?.server_data?.[0] || null
  );

  // Handle episode selection
  const handleEpisodeSelect = (episode: EpisodeItem) => {
    setSelectedEpisode(episode);
  };

  // Handle server selection
  const handleServerSelect = (serverIndex: number) => {
    setSelectedServer(serverIndex);
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

        {/* Server tabs */}
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

        {/* Episodes grid - Điều chỉnh hiển thị dựa vào số lượng tập */}
        <div className="rounded-lg bg-gray-800 p-4">
          {movie.episodes[selectedServer]?.server_data?.length === 1 &&
          movie.episodes[selectedServer]?.server_data[0]?.name.toLowerCase() === 'full' ? (
            // Nếu chỉ có 1 tập "Full", hiển thị nút nhỏ
            <div className="flex justify-start">
              <div className="w-24">
                <EpisodeButton
                  key={0}
                  episode={movie.episodes[selectedServer]?.server_data[0]}
                  isActive={true}
                  onClick={handleEpisodeSelect}
                />
              </div>
            </div>
          ) : (
            // Nếu có nhiều tập, hiển thị dạng lưới
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {movie.episodes[selectedServer]?.server_data?.map((episode, episodeIndex) => (
                <EpisodeButton
                  key={episodeIndex}
                  episode={episode}
                  isActive={selectedEpisode?.name === episode.name}
                  onClick={handleEpisodeSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
