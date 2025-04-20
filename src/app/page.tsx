import HomeClientPage from './client-page';
import { movieService } from '@/lib/services/api';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

export const revalidate = 3600; // revalidate every hour

export default async function HomePage() {
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
          movies: data.data,
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
