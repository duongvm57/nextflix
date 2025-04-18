'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMoviesClientPaginated } from '@/services/phimapi';
import { SORT_FIELD, SORT_TYPE } from '@/lib/menu/phimapi-menu';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { Movie } from '@/types';
import { MovieGrid } from '@/components/movie/movie-grid';
import { BackToTop } from '@/components/ui/back-to-top';
import { useTranslations } from 'next-intl';

export default function SearchClientPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!keyword) {
        setMovies([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const options = {
          sort_field: SORT_FIELD.MODIFIED_TIME,
          sort_type: SORT_TYPE.DESC,
          limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
        };
        // Use the client-paginated version of the search function
        const response = await searchMoviesClientPaginated(keyword, currentPage, options);

        // Check if response has data and items
        if (response && response.data) {
          setMovies(response.data);
          setTotalPages(response.pagination.totalPages);
        } else {
          // Handle empty response
          setMovies([]);
          setTotalPages(1);
        }
      } catch (error) {
        // Use a more user-friendly error handling approach
        setMovies([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword, currentPage]);

  const handlePageChange = (page: number) => {
    // Update URL with new page number
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page.toString());
      window.history.pushState({}, '', url);

      // Manually update the currentPage state to trigger the useEffect
      setIsLoading(true);
      const fetchSearchResults = async () => {
        try {
          const options = {
            sort_field: SORT_FIELD.MODIFIED_TIME,
            sort_type: SORT_TYPE.DESC,
            limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
          };
          // Use the client-paginated version of the search function
          const response = await searchMoviesClientPaginated(keyword, page, options);

          // Check if response has data and items
          if (response && response.data) {
            setMovies(response.data);
            setTotalPages(response.pagination.totalPages);
          } else {
            // Handle empty response
            setMovies([]);
            setTotalPages(1);
          }
        } catch (error) {
          // Use a more user-friendly error handling approach
          setMovies([]);
          setTotalPages(1);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSearchResults();
    } catch (error) {
      // Silently handle URL update errors
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">
          {keyword ? t('search.searchResults', { keyword }) : t('search.searchMovies')}
        </h1>

        {keyword ? (
          <MovieGrid
            movies={movies}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-xl text-gray-400">{t('search.enterSearchTerm')}</p>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <BackToTop threshold={500} />
    </>
  );
}
