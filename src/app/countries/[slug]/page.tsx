import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { getCountries } from '@/services/phimapi';
import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';

async function getMoviesByCountry(slug: string, page: number = 1) {
  try {
    return await movieService.getMoviesByCountry(slug, page);
  } catch (error) {
    console.error('Error fetching movies by country:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Tạo metadata động cho trang danh sách phim theo quốc gia
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Get country name from API
  const countries = await getCountries();
  const country = countries.find(c => c.slug === slug);

  // Use country name from API or format from slug if not found
  const countryName = country
    ? country.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  const title = `Phim ${countryName} - ${SITE_NAME}`;
  const description = `Tổng hợp phim ${countryName} hay nhất, cập nhật mới nhất. Xem phim ${countryName} online với chất lượng HD, phụ đề đầy đủ.`;

  return {
    title,
    description,
    keywords: `phim ${countryName}, phim hay ${countryName}, phim online, phim HD, phim mới`,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/countries/${slug}`,
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
      canonical: `${DOMAIN}/countries/${slug}`,
    },
  };
}

export default async function CountryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = await getMoviesByCountry(slug, page);

  // Get country name from API
  const countries = await getCountries();
  const country = countries.find(c => c.slug === slug);

  // Use country name from API or format from slug if not found
  const countryName = country
    ? country.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema
        items={[
          { name: 'Quốc gia', url: '/countries' },
          { name: countryName, url: `/countries/${slug}` },
        ]}
      />
      <h1 className="mb-8 text-3xl font-bold">Quốc gia: {countryName}</h1>

      {movies.length > 0 ? (
        <>
          <MovieGrid movies={movies} />

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              baseUrl={`/countries/${slug}`}
            />
          )}
        </>
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Không tìm thấy phim nào từ quốc gia này.</p>
        </div>
      )}
    </div>
  );
}
