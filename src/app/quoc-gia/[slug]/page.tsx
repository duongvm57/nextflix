import { getMoviesByCountry as apiGetMoviesByCountry } from '@/lib/api';
import { getCountries } from '@/lib/api';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { CountryClientPage } from './client-page';
import { Country, PaginatedResponse, Movie } from '@/types';
import { ApiParams } from '@/lib/api/client';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

async function getMoviesByCountry(
  slug: string,
  page: number = 1,
  options?: Partial<ApiParams>
): Promise<PaginatedResponse<Movie>> {
  try {
    // Kiểm tra xem slug có phải là country slug hợp lệ không
    const countries = await getCountries();
    const isValidCountry = countries.some((country: Country) => country.slug === slug);

    if (!isValidCountry) {
      console.error(`Invalid country slug: ${slug}`);
      return {
        data: [],
        pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
      };
    }

    if (options && Object.keys(options).length > 0) {
      console.log(`[Page] Fetching movies for country: ${slug} with options:`, options);
      return await apiGetMoviesByCountry(slug, page, options);
    } else {
      console.log(`[Page] Fetching movies for country: ${slug} without options`);
      return await apiGetMoviesByCountry(slug, page);
    }
  } catch (error) {
    console.error('Error fetching movies by country:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

type Props = {
  params: { slug: string };
  searchParams: { page?: string; type?: string; [key: string]: string | undefined };
};

export default async function CountryPage(props: Props) {
  // Use Promise.resolve to handle the params and searchParams
  const params = await Promise.resolve(props.params);
  const searchParams = await Promise.resolve(props.searchParams);

  // Now safely access the properties
  const slug = params.slug;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const typeParam = searchParams.type;

  // Tạo object options cho API
  const options: Partial<ApiParams> = {};
  if (typeParam) options.type = typeParam;

  console.log(`[Page] Country page options:`, options);

  const { data: movies, pagination } = await getMoviesByCountry(slug, page, options);

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

  // Prepare initial data for client component
  const initialData = {
    movies,
    pagination,
    countryName,
    slug,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema items={[{ name: countryName, url: `/quoc-gia/${slug}` }]} />
      <CountryClientPage initialData={initialData} />
    </div>
  );
}
