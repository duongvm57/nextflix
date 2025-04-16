'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMovies } from '@/services/api-updated';
import { Movie } from '@/types';
import { MovieGrid } from '@/components/movie/movie-grid';
import { useTranslations } from 'next-intl';

export default function MoviesPage() {
  const t = useTranslations('Movies');
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await getMovies(currentPage);
        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    // Update URL with new page number
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url);

    // This will trigger the useEffect to fetch new data
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('allMovies')}</h1>

      <MovieGrid
        movies={movies}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
