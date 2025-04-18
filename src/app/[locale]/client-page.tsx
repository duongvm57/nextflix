'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { getNewMoviesClientPaginated } from '@/services/phimapi';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { Movie } from '@/types';
import { MovieCard } from '@/components/movie/movie-card';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { BackToTop } from '@/components/ui/back-to-top';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function HomeClientPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  const {
    page,
    setIsLoading: setScrollLoading,
    hasMore,
    setHasMore
  } = useInfiniteScroll(containerRef, { threshold: 300 });

  // Initial load
  useEffect(() => {
    const fetchInitialMovies = async () => {
      setIsLoading(true);
      try {
        const response = await getNewMoviesClientPaginated(1);
        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching initial movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMovies();
  }, []);

  // Load more when scrolling
  useEffect(() => {
    if (page === 1 || !initialLoadComplete) return;

    const fetchMoreMovies = async () => {
      try {
        const response = await getNewMoviesClientPaginated(page);
        const newMovies = response.data;

        if (newMovies.length === 0) {
          setHasMore(false);
          return;
        }

        setMovies(prevMovies => [...prevMovies, ...newMovies]);

        // Check if we've reached the last page
        if (page >= response.pagination.totalPages) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching more movies:', error);
      } finally {
        setScrollLoading(false);
      }
    };

    fetchMoreMovies();
  }, [page, initialLoadComplete, setHasMore, setScrollLoading]);

  // Loading indicator
  const renderLoadingIndicator = () => {
    if (!hasMore) return null;

    return (
      <div className="flex justify-center py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  };

  // Check if we have movies before trying to access them
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <section className="relative mb-12 overflow-hidden rounded-xl">
          <div className="relative aspect-video w-full animate-pulse bg-gray-800"></div>
        </section>

        {/* Movies Grid Skeleton */}
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-800"></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array(PAGINATION_CONFIG.ITEMS_PER_PAGE / 2).fill(null).map((_, index) => (
            <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">{t('home.noMoviesAvailable')}</h1>
        <p className="mb-8 text-gray-400">{t('home.tryAgainLater')}</p>
      </div>
    );
  }

  // Get the first 10 movies for the hero carousel
  const heroMovies = movies.slice(0, 10);

  return (
    <>
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        {/* Hero Carousel Section */}
        {heroMovies.length > 0 && (
          <HeroCarousel
            movies={heroMovies}
            title={t('home.recentlyUpdated')}
            locale={locale}
          />
        )}

        {/* New Movies Section */}
        <section className="py-6">
          <h2 className="mb-6 text-2xl font-bold">{t('home.newMovies')}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${movie._id}-${index}`}
                movie={movie}
              />
            ))}
          </div>

          {/* Loading indicator */}
          {renderLoadingIndicator()}
        </section>
      </div>

      {/* Back to Top Button */}
      <BackToTop threshold={500} />
    </>
  );
}
