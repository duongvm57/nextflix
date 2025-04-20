'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MenuLink } from '@/components/ui/menu-link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Movie } from '@/types';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroCarouselProps {
  movies: Movie[];
  title: string;
}

export function HeroCarousel({ movies, title }: HeroCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sử dụng Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
  });

  // Các hàm điều khiển carousel
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Cập nhật currentIndex khi slide thay đổi
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Thiết lập sự kiện onSelect
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('select', onSelect);
    onSelect(); // Cập nhật index ban đầu

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        emblaApi.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="relative">
        {/* Large navigation buttons on sides - hidden on mobile */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:left-4 hidden md:block"
          aria-label="Previous movie"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:right-4 hidden md:block"
          aria-label="Next movie"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
        </button>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden no-select" ref={emblaRef}>
          {/* Embla Carousel Container */}
          <div className="flex">
            {movies.map((movie, index) => (
              <div
                key={movie._id}
                className="relative flex-shrink-0 w-full overflow-hidden rounded-xl"
              >
                {/* Thêm button phủ toàn bộ banner trên mobile */}
                <button
                  onClick={() => router.push(`/movie/${movie.slug}`)}
                  className="absolute inset-0 z-10 md:hidden"
                  aria-label={`Xem thông tin phim ${movie.name}`}
                />

                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={movie.thumb_url || movie.poster_url}
                    alt={movie.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

                  {/* Thêm link phủ toàn bộ banner trên mobile */}
                  <MenuLink href={`/movie/${movie.slug}`} className="absolute inset-0 md:hidden">
                    <span className="sr-only">Xem thông tin phim {movie.name}</span>
                  </MenuLink>
                </div>

                <div className="absolute bottom-0 left-0 p-4 md:p-12 w-full md:w-2/3 lg:w-1/2">
                  <h1 className="mb-1 text-xl font-bold md:text-4xl lg:text-5xl line-clamp-2 md:line-clamp-none md:mb-2">
                    {movie.name}
                  </h1>
                  <p className="mb-1 text-xs text-gray-300 md:mb-4 md:text-base line-clamp-1">
                    {movie.origin_name}
                  </p>

                  <div className="mb-1 flex flex-wrap gap-1 md:gap-2 md:mb-4">
                    {movie.category && (
                      <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] md:px-3 md:py-1 md:text-sm">
                        {movie.category.name}
                      </span>
                    )}
                    {movie.quality && (
                      <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] md:px-3 md:py-1 md:text-sm">
                        {movie.quality}
                      </span>
                    )}
                    {movie.year && (
                      <span className="rounded-full bg-gray-800 px-1.5 py-0.5 text-[10px] md:px-3 md:py-1 md:text-sm">
                        {movie.year}
                      </span>
                    )}
                  </div>

                  <p className="hidden md:block mb-4 line-clamp-2 text-xs text-gray-300 md:mb-6 md:line-clamp-3 md:text-base">
                    {movie.content}
                  </p>

                  {/* Ẩn buttons trên mobile */}
                  <div className="hidden md:flex flex-wrap gap-4">
                    <MenuLink href={`/watch/${movie.slug}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2 md:text-base md:px-4 md:py-2"
                      >
                        <Play size={16} fill="white" className="md:h-5 md:w-5" />
                        Xem phim
                      </Button>
                    </MenuLink>
                    <MenuLink href={`/movie/${movie.slug}`}>
                      <Button variant="outline" size="sm" className="md:text-base md:px-4 md:py-2">
                        Thông tin thêm
                      </Button>
                    </MenuLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thu nhỏ pagination dots */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
          {movies.map((_, index) => (
            <button
              key={index}
              className={`h-1 w-1 md:h-1.5 md:w-1.5 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={() => {
                if (emblaApi) emblaApi.scrollTo(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
