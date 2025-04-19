'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Movie } from '@/types';
import { Button } from '@/components/ui/button';

interface MovieCarouselProps {
  movies: Movie[];
  title: string;
}

export function MovieCarousel({ movies, title }: MovieCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'auto',
          scrollSnapType: 'x proximity',
          scrollBehavior: 'smooth',
          touchAction: 'pan-x',
          cursor: 'grab'
        }}
      >
        {movies.map(movie => (
          <div
            key={movie._id}
            className="relative flex-shrink-0 overflow-hidden rounded-lg"
            style={{ width: '300px' }}
          >
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={movie.poster_url || movie.thumb_url}
                alt={movie.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="mb-1 text-lg font-bold line-clamp-1">{movie.name}</h3>
                <p className="mb-2 text-sm text-gray-300 line-clamp-1">{movie.origin_name}</p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {movie.quality && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs">
                      {movie.quality}
                    </span>
                  )}
                  {movie.year && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs">
                      {movie.year}
                    </span>
                  )}
                </div>

                <Link href={`/watch/${movie.slug}`}>
                  <Button variant="primary" size="sm" className="flex items-center gap-1 w-full">
                    <Play size={16} fill="white" />
                    Xem ngay
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
