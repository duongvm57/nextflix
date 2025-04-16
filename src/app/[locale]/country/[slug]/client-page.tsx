'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { getMoviesByCountry } from '@/services/api-updated';
import { Movie } from '@/types';
import { MovieGrid } from '@/components/movie/movie-grid';
import { useTranslations } from 'next-intl';

// Map of country slugs to translation keys
const COUNTRY_TRANSLATION_KEYS: Record<string, string> = {
  'au-my': 'country.american',
  'trung-quoc': 'country.chinese',
  'han-quoc': 'country.korean',
  'nhat-ban': 'country.japanese',
  'thai-lan': 'country.thai',
  'hong-kong': 'country.hongKong',
  'viet-nam': 'country.vietnamese',
  'dai-loan': 'country.daiLoan',
  'an-do': 'country.indian',
  'anh': 'country.british',
  'phap': 'country.french',
  'canada': 'country.canadian',
  'quoc-gia-khac': 'country.other',
};

export default function CountryClientPage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [countryName, setCountryName] = useState('');
  
  const t = useTranslations();
  
  useEffect(() => {
    const fetchMoviesByCountry = async () => {
      setIsLoading(true);
      try {
        const response = await getMoviesByCountry(slug, currentPage);
        setMovies(response.data);
        setTotalPages(response.pagination.totalPages);
        
        // Get country name from translations if available
        const translationKey = COUNTRY_TRANSLATION_KEYS[slug];
        const name = translationKey
          ? t(translationKey)
          : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        setCountryName(name);
      } catch (error) {
        console.error(`Error fetching movies for country ${slug}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMoviesByCountry();
  }, [slug, currentPage, t]);
  
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
      <h1 className="mb-8 text-3xl font-bold">{countryName}</h1>
      
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
