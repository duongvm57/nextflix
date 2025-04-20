import { MetadataRoute } from 'next';
import { getCategories, getCountries } from '@/lib/api';
import { DOMAIN } from '@/lib/constants';
import { Category, Country } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Lấy danh sách thể loại và quốc gia từ API
  const [categories, countries] = await Promise.all([getCategories(), getCountries()]);

  // Tạo sitemap cho các trang tĩnh
  const staticPages = [
    {
      url: `${DOMAIN}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${DOMAIN}/tim-kiem`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/chu-de`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Tạo sitemap cho các trang thể loại
  const categoryPages = categories.map((category: Category) => ({
    url: `${DOMAIN}/the-loai/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tạo sitemap cho các trang quốc gia
  const countryPages = countries.map((country: Country) => ({
    url: `${DOMAIN}/quoc-gia/${country.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Tạo sitemap cho các trang năm
  const currentYear = new Date().getFullYear();
  const yearPages = Array.from({ length: 10 }, (_, i) => ({
    url: `${DOMAIN}/danh-muc/${currentYear - i}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Kết hợp tất cả các trang
  return [...staticPages, ...categoryPages, ...countryPages, ...yearPages];
}
