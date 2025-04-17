'use client';

import { Movie } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatViewCount, getImageUrl, truncateText } from '@/lib/utils';
import { Play, Star } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'featured';
}

export function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  const isFeatured = variant === 'featured';
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <div className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${isFeatured ? 'h-[400px]' : 'h-[320px]'}`}>
      <div className="relative h-full w-full">
        <Link href={`/${locale}/movie/${movie.slug}`} className="block h-full w-full">
          <Image
            src={getImageUrl(isFeatured ? movie.poster_url : movie.thumb_url)}
            alt={movie.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Movie info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="mb-1 font-bold leading-tight">
              {truncateText(movie.name, 40)}
            </h3>
            <p className="text-sm text-gray-300">{movie.origin_name}</p>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-xs">{movie.quality}</span>
                </span>
                <span className="text-xs">{movie.year}</span>
              </div>
              <span className="text-xs">{formatViewCount(movie.view)} views</span>
            </div>

            {movie.episode_current && (
              <div className="mt-2 inline-block rounded bg-red-600 px-2 py-1 text-xs font-medium">
                {movie.episode_current}
              </div>
            )}
          </div>
        </Link>

        {/* Play button overlay (visible on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link href={`/${locale}/watch/${movie.slug}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/80 text-white">
              <Play size={20} fill="white" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
