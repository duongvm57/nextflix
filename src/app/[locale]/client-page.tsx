'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { getNewMovies } from '@/services/api-updated';
import { Movie } from '@/types';
import { MovieGrid } from '@/components/movie/movie-grid';
import { HeroCarousel } from '@/components/movie/hero-carousel';

export default function HomeClientPage() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const t = useTranslations();

  useEffect(() => {
    const fetchNewMovies = async () => {
      setIsLoading(true);
      try {
        const response = await getNewMovies(currentPage);
        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching new movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewMovies();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    // Update URL with new page number
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page.toString());
      window.history.pushState({}, '', url);

      // Manually update the currentPage state to trigger the useEffect
      setIsLoading(true);
      const fetchNewMovies = async () => {
        try {
          const response = await getNewMovies(page);
          setMovies(response.data);
          setTotalPages(response.pagination.totalPages);
        } catch (error) {
          console.error('Error fetching new movies:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchNewMovies();
    } catch (error) {
      console.error('Error updating URL:', error);
    }
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
          {Array(10).fill(null).map((_, index) => (
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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel Section */}
      {heroMovies.length > 0 && (
        <HeroCarousel
          movies={heroMovies}
          title={t('home.recentlyUpdated')}
          locale={locale}
        />
      )}

      {/* New Movies Section */}
      <MovieGrid
        movies={movies}
        title={t('home.newMovies')}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
