'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Movie } from '@/types';
import { getMoviesByCountry } from '@/services/phimapi';
import { getImageUrl } from '@/lib/utils';
import { MenuLink } from '@/components/ui/menu-link';
import useEmblaCarousel from 'embla-carousel-react';

interface CountryMoviesSectionProps {
  countrySlug: string;
  countryName: string;
  className?: string;
}

export function CountryMoviesSection({ countrySlug, countryName, className = '' }: CountryMoviesSectionProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sử dụng Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    align: 'start',
    slidesToScroll: 1
  });

  // Các hàm điều khiển carousel
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await getMoviesByCountry(countrySlug, currentPage, {
          limit: '20', // Tải sẵn 20 phim
        });

        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error(`Error fetching movies for country ${countrySlug}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [countrySlug, currentPage]);

  // Function to load next page of movies
  const loadNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else {
      // Quay lại trang đầu tiên khi đã đến trang cuối
      setCurrentPage(1);
    }
  };

  // Button scroll handlers
  const scrollLeftBtn = scrollPrev;
  const scrollRightBtn = scrollNext;

  if (isLoading) {
    return (
      <div className={`mb-12 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Phim {countryName} mới</h2>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 mr-2">
              <div className="p-1 rounded-full bg-gray-800 w-8 h-8 animate-pulse"></div>
              <div className="p-1 rounded-full bg-gray-800 w-8 h-8 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-gray-800 rounded-full w-20 h-8 animate-pulse"></div>
              <div className="px-3 py-1 bg-gray-800 rounded-full w-24 h-8 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array(8).fill(null).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[180px] h-[270px] animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
              onClick={scrollLeftBtn}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRightBtn}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/countries/${countrySlug}`}
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
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="flex-shrink-0 group relative overflow-hidden rounded-lg w-[180px] h-[270px]"
              >
                <MenuLink
                  href={`/watch/${movie.slug}`}
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
