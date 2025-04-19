'use client';

import { CountryMoviesSection } from './country-movies-section';
import { Movie } from '@/types';

interface FeaturedCountriesSectionProps {
  className?: string;
  countriesData?: {
    slug: string;
    name: string;
    movies: Movie[];
  }[];
}

export function FeaturedCountriesSection({
  className = '',
  countriesData = [],
}: FeaturedCountriesSectionProps) {
  return (
    <div className={className}>
      {countriesData.map(country => (
        <CountryMoviesSection
          key={country.slug}
          countrySlug={country.slug}
          countryName={country.name}
          initialMovies={country.movies}
        />
      ))}
    </div>
  );
}
