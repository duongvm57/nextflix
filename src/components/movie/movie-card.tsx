'use client';

import { Movie } from '@/types';
import Image from 'next/image';
import { MenuLink } from '@/components/ui/menu-link';
import { formatViewCount, getImageUrl, truncateText } from '@/lib/utils';
import { Play, Star } from 'lucide-react';

import { TouchRipple } from '@/components/ui/touch-ripple';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  const isFeatured = variant === 'featured';

  return (
    <div
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 movie-card-${movie._id} ${isFeatured ? 'h-[300px] sm:h-[350px] md:h-[400px]' : 'h-[200px] sm:h-[250px] md:h-[320px]'}`}
    >
      <TouchRipple className={`movie-card-${movie._id}`} />
      <div className="relative h-full w-full">
        {/* Toàn bộ thẻ có thể click để xem thông tin phim */}
        <MenuLink
          href={`/movie/${movie.slug}`}
          className="block h-full w-full active:opacity-80 active:scale-95 transition-all duration-150 touch-highlight"
        >
          <Image
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Movie info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white">
            <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base font-bold leading-tight">
              {truncateText(movie.name, isFeatured ? 40 : 25)}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-1">{movie.origin_name}</p>

            <div className="mt-1 sm:mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <Star size={12} className="fill-yellow-500 text-yellow-500 hidden xs:inline" />
                  <span className="text-[10px] xs:text-xs">{movie.quality}</span>
                </span>
                <span className="text-[10px] xs:text-xs">{movie.year}</span>
              </div>
              <span className="text-[10px] xs:text-xs">{formatViewCount(movie.view)} views</span>
            </div>

            {movie.episode_current && (
              <div className="mt-1 sm:mt-2 inline-block rounded bg-red-600 px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] xs:text-xs font-medium">
                {movie.episode_current}
              </div>
            )}
          </div>

          {/* Play button overlay (visible on hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary/80 text-white active:bg-primary/100 active:scale-90 transition-all duration-150">
              <Play size={16} className="sm:hidden" fill="white" />
              <Play size={18} className="hidden sm:block md:hidden" fill="white" />
              <Play size={20} className="hidden md:block" fill="white" />
            </div>
          </div>
        </MenuLink>
      </div>
    </div>
  );
}
