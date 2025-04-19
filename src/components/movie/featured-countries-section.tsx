'use client';

import { CountryMoviesSection } from './country-movies-section';

interface FeaturedCountriesSectionProps {
  className?: string;
}

export function FeaturedCountriesSection({ className = '' }: FeaturedCountriesSectionProps) {
  // Danh sách 3 quốc gia cần hiển thị
  const featuredCountries = [
    { slug: 'han-quoc', name: 'Hàn Quốc' },
    { slug: 'trung-quoc', name: 'Trung Quốc' },
    { slug: 'au-my', name: 'US-UK' }
  ];

  return (
    <div className={className}>
      {featuredCountries.map((country) => (
        <CountryMoviesSection 
          key={country.slug}
          countrySlug={country.slug}
          countryName={country.name}
        />
      ))}
    </div>
  );
}
