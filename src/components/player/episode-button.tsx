'use client';

import { EpisodeItem } from '@/types';

interface EpisodeButtonProps {
  episode: EpisodeItem;
  isActive: boolean;
  onClick: (episode: EpisodeItem) => void;
}

export function EpisodeButton({ episode, isActive, onClick }: EpisodeButtonProps) {
  return (
    <button
      className={`rounded px-3 py-2 text-center ${
        isActive ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={() => onClick(episode)}
    >
      {episode.name}
    </button>
  );
}
