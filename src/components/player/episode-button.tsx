'use client';

import { EpisodeItem } from '@/types';
import { memo } from 'react';

interface EpisodeButtonProps {
  episode: EpisodeItem;
  isActive: boolean;
  onClick: (episode: EpisodeItem) => void;
  className?: string;
}

const EpisodeButton = memo(function EpisodeButton({
  episode,
  isActive,
  onClick,
  className = '',
}: EpisodeButtonProps) {
  return (
    <button
      className={`rounded px-3 py-2 text-center ${
        isActive ? 'bg-primary text-white' : 'bg-gray-700 hover:bg-gray-600'
      } ${className}`}
      onClick={() => onClick(episode)}
    >
      {episode.name}
    </button>
  );
});

EpisodeButton.displayName = 'EpisodeButton';

export { EpisodeButton };
