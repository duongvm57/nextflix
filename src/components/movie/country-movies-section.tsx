'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { MenuLink } from '@/components/ui/menu-link';
import useEmblaCarousel from 'embla-carousel-react';

interface CountryMoviesSectionProps {
  countrySlug: string;
  countryName: string;
  initialMovies: Movie[];
  className?: string;
}

export function CountryMoviesSection({
  countrySlug,
  countryName,
  initialMovies,
  className = '',
}: CountryMoviesSectionProps) {
  const [movies] = useState<Movie[]>(initialMovies);

  // Sử dụng Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
    slidesToScroll: 1,
  });

  // Các hàm điều khiển carousel
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className={`mb-12 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Phim {countryName} mới</h2>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <button
              onClick={scrollPrev}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/quoc-gia/${countrySlug}`}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm transition-colors"
            >
              Xem toàn bộ
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden no-select" ref={emblaRef}>
          {/* Embla Carousel Container */}
          <div className="flex gap-4 pb-4">
            {movies.map(movie => (
              <div
                key={movie._id}
                className="flex-shrink-0 group relative overflow-hidden rounded-lg w-[180px] h-[270px]"
              >
                <MenuLink
                  href={`/phim/${movie.slug}`}
                  className="block h-full w-full active:opacity-80 active:scale-95 transition-all duration-150"
                >
                  <Image
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="180px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  <div className="absolute bottom-0 left-0 p-3 w-full">
                    <h3 className="text-sm font-bold line-clamp-2">{movie.name}</h3>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {movie.quality && (
                        <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px]">
                          {movie.quality}
                        </span>
                      )}
                      {movie.year && (
                        <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px]">
                          {movie.year}
                        </span>
                      )}
                      {movie.episode_current && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px]">
                          Tập {movie.episode_current}
                        </span>
                      )}
                    </div>
                  </div>
                </MenuLink>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
