'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { triggerLoading } from '@/components/ui/loading-indicator';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Movie, PaginatedResponse } from '@/types';
import { clientCache } from '@/lib/cache/client-cache';

interface CategoryClientPageProps {
  initialData: {
    movies: Movie[];
    pagination: {
      totalItems: number;
      totalItemsPerPage: number;
      currentPage: number;
      totalPages: number;
    };
    title: string;
    slug: string;
  };
  isYear: boolean;
}

export function CategoryClientPage({ initialData, isYear }: CategoryClientPageProps) {
  const { movies: initialMovies, pagination: initialPagination, title, slug } = initialData;

  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1;

  // Fetch movies with caching
  const fetchMoviesWithCache = useCallback(
    async (pageNum: number) => {
      const cacheKey = `category_${slug}_page_${pageNum}`;
      const cachedData = clientCache.get<PaginatedResponse<Movie>>(cacheKey);

      if (cachedData) {
        console.log(`Using cached data for ${slug} page ${pageNum}`);
        return cachedData;
      }

      console.log(`Fetching fresh data for ${slug} page ${pageNum}`);

      // Determine which API endpoint to use based on isYear flag
      let response;
      if (isYear) {
        // Fetch movies by year
        response = await fetch(`/api/movies/year/${slug}?page=${pageNum}`);
      } else {
        // Fetch movies by category
        response = await fetch(`/api/movies/category/${slug}?page=${pageNum}`);
      }

      if (!response.ok) {
        throw new Error(`Error fetching movies: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache for 5 minutes
      clientCache.set(cacheKey, data, 5 * 60 * 1000);

      return data;
    },
    [slug, isYear]
  );

  // Update data when page changes
  useEffect(() => {
    const updateData = async () => {
      if (page === initialPagination.currentPage) {
        // Use initial data for first render
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetchMoviesWithCache(page);
        setMovies(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error(`Error fetching movies for ${slug} page ${page}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    updateData();
  }, [page, slug, initialPagination.currentPage, fetchMoviesWithCache]);

  // Prefetch next page
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Only prefetch if we're not loading and there are more pages
    if (!isLoading && page < pagination.totalPages) {
      const nextPage = page + 1;
      const cacheKey = `category_${slug}_page_${nextPage}`;

      // Check if already cached
      if (!clientCache.get(cacheKey)) {
        console.log(`Prefetching data for ${slug} page ${nextPage}`);
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
  }, [page, isLoading, pagination.totalPages, slug, fetchMoviesWithCache]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Show loading immediately
    setIsLoading(true);
    triggerLoading();

    // Create new search params
    const params = new URLSearchParams(searchParams?.toString());

    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }

    // Update URL without reloading page
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {Array(10)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
            ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/categories/${slug}`}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào.</p>
        </div>
      )}
    </div>
  );
}
