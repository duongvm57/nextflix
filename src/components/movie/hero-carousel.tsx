'use client';

import { useRef, useState, useEffect, TouchEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Movie } from '@/types';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface HeroCarouselProps {
  movies: Movie[];
  title: string;
  locale: string;
}

export function HeroCarousel({ movies, title, locale }: HeroCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const t = useTranslations();

  const scrollLeft = () => {
    if (isAnimating || !scrollContainerRef.current) return;

    setIsAnimating(true);
    const newIndex = (currentIndex - 1 + movies.length) % movies.length;
    setCurrentIndex(newIndex);

    scrollContainerRef.current.scrollTo({
      left: newIndex * scrollContainerRef.current.offsetWidth,
      behavior: 'smooth',
    });

    setTimeout(() => setIsAnimating(false), 500);
  };

  const scrollRight = () => {
    if (isAnimating || !scrollContainerRef.current) return;

    setIsAnimating(true);
    const newIndex = (currentIndex + 1) % movies.length;
    setCurrentIndex(newIndex);

    scrollContainerRef.current.scrollTo({
      left: newIndex * scrollContainerRef.current.offsetWidth,
      behavior: 'smooth',
    });

    setTimeout(() => setIsAnimating(false), 500);
  };

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      scrollRight();
    }
    if (isRightSwipe) {
      scrollLeft();
    }

    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating && document.visibilityState === 'visible') {
        scrollRight();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAnimating]);

  // Handle manual scroll
  const handleScroll = () => {
    if (isAnimating || !scrollContainerRef.current) return;

    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / itemWidth);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-12">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <div className="relative">
        {/* Large navigation buttons on sides */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:left-4"
          aria-label="Previous movie"
        >
          <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
        </button>

        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:right-4"
          aria-label="Next movie"
        >
          <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
        </button>

        <div
          ref={scrollContainerRef}
          className="relative flex touch-pan-x snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {movies.map((movie, index) => (
            <div
              key={movie._id}
              className="relative flex-shrink-0 w-full snap-center overflow-hidden rounded-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={movie.poster_url || movie.thumb_url}
                  alt={movie.name}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 p-4 md:p-12 md:w-2/3 lg:w-1/2">
                <h1 className="mb-2 text-2xl font-bold md:text-4xl lg:text-5xl">{movie.name}</h1>
                <p className="mb-2 text-sm text-gray-300 md:mb-4 md:text-base">
                  {movie.origin_name}
                </p>

                <div className="mb-2 flex flex-wrap gap-2 md:mb-4">
                  {movie.category && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm">
                      {movie.category.name}
                    </span>
                  )}
                  {movie.quality && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm">
                      {movie.quality}
                    </span>
                  )}
                  {movie.year && (
                    <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm">
                      {movie.year}
                    </span>
                  )}
                </div>

                <p className="mb-4 line-clamp-2 text-xs text-gray-300 md:mb-6 md:line-clamp-3 md:text-base">
                  {movie.content}
                </p>

                <div className="flex flex-wrap gap-2 md:gap-4">
                  <Link href={`/${locale}/watch/${movie.slug}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 md:text-base md:px-4 md:py-2"
                    >
                      <Play size={16} fill="white" className="md:h-5 md:w-5" />
                      {t('home.watchNow')}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/movie/${movie.slug}`}>
                    <Button variant="outline" size="sm" className="md:text-base md:px-4 md:py-2">
                      {t('home.moreInfo')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
            onClick={() => {
              if (scrollContainerRef.current) {
                setCurrentIndex(index);
                scrollContainerRef.current.scrollTo({
                  left: index * scrollContainerRef.current.offsetWidth,
                  behavior: 'smooth',
                });
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
