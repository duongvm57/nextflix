import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { getCountries } from '@/lib/api';
import { Country } from '@/types';

// Tạo metadata động cho trang quốc gia
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Get country name from API
  const countries = await getCountries();
  const country = countries.find((c: Country) => c.slug === slug);

  // Use country name from API or format from slug if not found
  const countryName = country
    ? country.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  // Tiêu đề quốc gia mặc định
  const title = `Danh sách phim ${countryName} - tổng hợp phim ${countryName}`;

  // Description quốc gia mặc định
  const description = `Phim ${countryName} mới nhất tuyển chọn hay nhất. Top những bộ phim ${countryName} đáng để bạn cày 2025`;

  // Keywords quốc gia mặc định
  const keywords = `Xem phim ${countryName},Phim ${countryName} mới,Phim ${countryName} 2025,phim hay`;

  // Thông tin bổ sung
  const additionalInfo = `Thông tin: ${countryName}`;

  return {
    title,
    description: `${description}\n${additionalInfo}`,
    keywords,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/quoc-gia/${slug}`,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${DOMAIN}/quoc-gia/${slug}`,
    },
  };
}
