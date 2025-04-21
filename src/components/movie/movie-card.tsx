'use client';

import { Movie } from '@/types';
import Image from 'next/image';
import { MenuLink } from '@/components/ui/menu-link';
import { getImageUrl, truncateText } from '@/lib/utils';
import { ImageOff, Play } from 'lucide-react';
import { useState } from 'react';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  const isFeatured = variant === 'featured';
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${isFeatured ? 'h-[300px] sm:h-[350px] md:h-[400px]' : 'h-[200px] sm:h-[250px] md:h-[320px]'}`}
    >
      <MenuLink
        href={`/phim/${movie.slug}`}
        className="block h-full w-full active:opacity-80 active:scale-95 transition-all duration-150"
      >
        {imageError ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-800">
            <ImageOff size={24} />
          </div>
        ) : (
          <Image
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white">
          <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base font-bold leading-tight text-shadow-sm">
            {truncateText(movie.name, isFeatured ? 40 : 25)}
          </h3>
          <p className="text-xs sm:text-sm text-gray-200 line-clamp-1 text-shadow-sm">
            {movie.origin_name}
          </p>

          <div className="mt-1 sm:mt-2 flex items-center justify-between">
            <span className="text-[10px] xs:text-xs text-gray-100 text-shadow-sm">
              {movie.quality} • {movie.year}
            </span>
          </div>

          {movie.episode_current && (
            <div className="mt-1 sm:mt-2 inline-block rounded bg-red-600 px-1.5 py-0.5 text-[10px] xs:text-xs font-medium">
              {movie.episode_current}
            </div>
          )}
        </div>

        {/* Play button overlay (visible on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/80 text-white">
            <Play size={18} fill="white" />
          </div>
        </div>
      </MenuLink>
    </div>
  );
}
