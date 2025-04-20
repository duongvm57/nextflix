import { Suspense } from 'react';
import HomeClientPage from './client-page';
import { movieService } from '@/lib/services/api';
import { COUNTRY_MOVIES_ITEMS } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

export const revalidate = 3600; // revalidate every hour

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Đang tải..." />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // Lấy dữ liệu phim theo quốc gia để truyền vào HomeClientPage
  const countries = [
    { slug: 'han-quoc', name: 'Hàn Quốc' },
    { slug: 'trung-quoc', name: 'Trung Quốc' },
    { slug: 'au-my', name: 'US-UK' },
  ];

  const countriesData = await Promise.all(
    countries.map(async country => {
      try {
        const data = await movieService.getMoviesByCountry(country.slug, 1);
        return {
          ...country,
          movies: data.data.slice(0, COUNTRY_MOVIES_ITEMS),
        };
      } catch (error) {
        console.error(`Error fetching movies for ${country.name}:`, error);
        return {
          ...country,
          movies: [],
        };
      }
    })
  );

  return <HomeClientPage initialCountriesData={countriesData} />;
}
