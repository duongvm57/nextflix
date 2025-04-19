'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import { getNewMoviesClientPaginated } from '@/services/phimapi';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { Movie, PaginatedResponse } from '@/types';
import { MovieCard } from '@/components/movie/movie-card';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { BackToTop } from '@/components/ui/back-to-top';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { clientCache } from '@/lib/cache/client-cache';

export default function HomeClientPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    page,
    setIsLoading: setScrollLoading,
    hasMore,
    setHasMore,
  } = useInfiniteScroll(containerRef, { threshold: 300 });

  // Function to fetch movies with caching
  const fetchMoviesWithCache = useCallback(async (page: number) => {
    const cacheKey = `movies_page_${page}`;
    const cachedData = clientCache.get<PaginatedResponse<Movie>>(cacheKey);

    if (cachedData) {
      console.log(`Using cached data for page ${page}`);
      return cachedData;
    }

    console.log(`Fetching fresh data for page ${page}`);

    // Add a small delay to show loading indicator (only for visual feedback)
    if (page > 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const response = await getNewMoviesClientPaginated(page);

    // Cache for 5 minutes
    clientCache.set(cacheKey, response, 5 * 60 * 1000);

    return response;
  }, []);

  // Initial load
  useEffect(() => {
    const fetchInitialMovies = async () => {
      setIsLoading(true);
      try {
        const response = await fetchMoviesWithCache(1);
        setMovies(response.data);

        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching initial movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMovies();
  }, [fetchMoviesWithCache]);

  // Prefetch next page
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Only prefetch if we're not loading and initial load is complete
    if (initialLoadComplete && !isLoading) {
      const nextPage = page + 1;
      const cacheKey = `movies_page_${nextPage}`;

      // Check if already cached
      if (!clientCache.get(cacheKey)) {
        console.log(`Prefetching data for page ${nextPage}`);
        // Use setTimeout to avoid blocking the main thread
        timer = setTimeout(() => {
          fetchMoviesWithCache(nextPage).catch(err =>
            console.error(`Error prefetching page ${nextPage}:`, err)
          );
        }, 1000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [page, isLoading, initialLoadComplete, fetchMoviesWithCache]);

  // Load more when scrolling
  useEffect(() => {
    if (page === 1 || !initialLoadComplete) return;

    const fetchMoreMovies = async () => {
      try {
        const response = await fetchMoviesWithCache(page);
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
  }, [page, initialLoadComplete, setHasMore, setScrollLoading, fetchMoviesWithCache]);

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
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {Array(PAGINATION_CONFIG.ITEMS_PER_PAGE / 2)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
            ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Không có phim nào</h1>
        <p className="mb-8 text-gray-400">Vui lòng thử lại sau hoặc kiểm tra kết nối của bạn.</p>
      </div>
    );
  }

  // Get the first 10 movies for the hero carousel
  const heroMovies = movies.slice(0, 10);

  return (
    <>
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        {/* SEO H1 heading - ẩn khỏi giao diện nhưng vẫn hiển thị cho search engines */}
        <h1 className="sr-only">Nextflix - Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD</h1>

        {/* Hero Carousel Section */}
        {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} title="" />}

        {/* New Movies Section */}
        <section className="py-6">
          <h2 className="mb-6 text-2xl font-bold">Phim mới</h2>
          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
            {movies.map((movie, index) => (
              <MovieCard key={`${movie._id}-${index}`} movie={movie} />
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
