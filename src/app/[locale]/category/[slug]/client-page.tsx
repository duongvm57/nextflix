'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getMoviesByCategory } from '@/services/api-updated';
import { Movie } from '@/types';
import { MovieGrid } from '@/components/movie/movie-grid';

export default function CategoryClientPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  
  useEffect(() => {
    const fetchMoviesByCategory = async () => {
      setIsLoading(true);
      try {
        const response = await getMoviesByCategory(slug, currentPage);
        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
        
        // Set category display name based on slug
        let name = '';
        switch (slug) {
          case 'phim-le':
            name = 'Movies';
            break;
          case 'phim-bo':
            name = 'TV Series';
            break;
          case 'hoat-hinh':
            name = 'Anime';
            break;
          case 'phim-dang-chieu':
            name = 'Now Showing';
            break;
          case 'phim-sap-chieu':
            name = 'Coming Soon';
            break;
          default:
            name = slug.split('-').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }
        setCategoryName(name);
      } catch (error) {
        console.error(`Error fetching movies for category ${slug}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMoviesByCategory();
  }, [slug, currentPage]);
  
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
      <h1 className="mb-8 text-3xl font-bold">{categoryName}</h1>
      
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
