import { Metadata } from 'next';
import { DOMAIN, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/constants';
import HomeClientPage from './client-page';
import { movieService } from '@/lib/services/api';

// Tạo metadata cho trang chủ
export function generateMetadata(): Metadata {
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: DOMAIN,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    alternates: {
      canonical: DOMAIN,
    },
  };
}

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
