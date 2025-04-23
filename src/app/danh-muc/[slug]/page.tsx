import {
  getMoviesByCategory as apiGetMoviesByCategory,
  getMoviesByYear as apiGetMoviesByYear,
  getCategories,
} from '@/lib/api';
import { CategoryClientPage } from './client-page';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { Category, PaginatedResponse, Movie } from '@/types';
import { ApiParams } from '@/lib/api/client';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

// Map of category slugs to display names
const CATEGORY_NAMES: Record<string, string> = {
  'phim-le': 'Phim lẻ',
  'phim-bo': 'Phim bộ',
  'hoat-hinh': 'Hoạt hình',
  'phim-vietsub': 'Phim Vietsub',
  'phim-thuyet-minh': 'Phim Thuyết minh',
  'phim-long-tieng': 'Phim Lồng tiếng',
  'tv-shows': 'TV Shows',
};

async function getMoviesByCategory(
  slug: string,
  page: number = 1,
  options?: Partial<ApiParams> | string
): Promise<PaginatedResponse<Movie>> {
  try {
    if (typeof options === 'string') {
      // Nếu options là string, coi nó là type
      console.log(`[Page] Fetching movies for category: ${slug}, page: ${page}, type: ${options}`);
      return await apiGetMoviesByCategory(slug, page, { type: options });
    } else if (options && Object.keys(options).length > 0) {
      // Nếu options là object và có ít nhất 1 key
      console.log(`[Page] Fetching movies for category: ${slug}, page: ${page}, options:`, options);
      return await apiGetMoviesByCategory(slug, page, options);
    } else {
      // Nếu không có options
      console.log(`[Page] Fetching movies for category: ${slug}, page: ${page}, no options`);
      return await apiGetMoviesByCategory(slug, page);
    }
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

async function getMoviesByYear(
  year: string,
  page: number = 1,
  options?: Partial<ApiParams>
): Promise<PaginatedResponse<Movie>> {
  try {
    if (options && Object.keys(options).length > 0) {
      console.log(`[Page] Fetching movies for year: ${year}, page: ${page}, options:`, options);
      return await apiGetMoviesByYear(year, page, options);
    } else {
      console.log(`[Page] Fetching movies for year: ${year}, page: ${page}, no options`);
      return await apiGetMoviesByYear(year, page);
    }
  } catch (error) {
    console.error('Error fetching movies by year:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Map of special category slugs to display names that might not be in the API
const SPECIAL_CATEGORY_NAMES: Record<string, string> = {
  'phim-le': 'Phim lẻ',
  'phim-bo': 'Phim bộ',
  'hoat-hinh': 'Hoạt hình',
  'phim-vietsub': 'Phim Vietsub',
  'phim-thuyet-minh': 'Phim Thuyết minh',
  'phim-long-tieng': 'Phim Lồng tiếng',
  'tv-shows': 'TV Shows',
};

type Props = {
  params: { slug: string };
  searchParams: { page?: string; type?: string; [key: string]: string | undefined };
};

export default async function ListingPage(props: Props) {
  // Use Promise.resolve to handle the params and searchParams
  const params = await Promise.resolve(props.params);
  const searchParams = await Promise.resolve(props.searchParams);

  // Lấy các tham số từ URL
  const slug = params.slug;
  const pageParam = searchParams.page;
  const typeParam = searchParams.type;
  const countryParam = searchParams.country;
  const yearParam = searchParams.year;
  const sortFieldParam = searchParams.sort_field;
  const sortTypeParam = searchParams.sort_type;
  const sortLangParam = searchParams.sort_lang;

  // Chuyển đổi các tham số
  const page = pageParam ? parseInt(pageParam) : 1;

  // Tạo object options cho API
  const options: Partial<ApiParams> = {};
  if (typeParam) options.type = typeParam;
  if (countryParam) options.country = countryParam;
  if (yearParam) options.year = yearParam;
  if (sortFieldParam) options.sort_field = sortFieldParam;
  if (sortTypeParam) options.sort_type = sortTypeParam;
  if (sortLangParam) options.sort_lang = sortLangParam;

  // Log các tham số filter
  console.log('[Page] Filter params:', {
    typeParam,
    countryParam,
    yearParam,
    sortFieldParam,
    sortTypeParam,
    sortLangParam
  });
  console.log('[Page] Options object:', options);

  // Check if slug is a year (4 digits)
  const isYear = /^\d{4}$/.test(slug);

  console.log(`[Page] Processing ${slug} with options:`, options);

  let movies;
  let pagination;
  let title;

  // Sử dụng CATEGORY_NAMES đã được định nghĩa ở đầu file

  if (isYear) {
    // Get movies by year
    const result = await getMoviesByYear(slug, page, options);
    movies = result.data;
    pagination = result.pagination;
    title = `Phim năm ${slug}`;
  } else {
    // Get movies by category with options
    console.log(`[Page] Fetching movies for category: ${slug} with options:`, options);
    const result = await getMoviesByCategory(slug, page, options);
    movies = result.data;
    pagination = result.pagination;
    title = CATEGORY_NAMES[slug] || `Phim ${slug}`;

    // Redirect to the last page if current page is greater than total pages
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      return Response.redirect(`/danh-muc/${slug}?page=${pagination.totalPages}`);
    }

    // First check if it's a special category
    if (SPECIAL_CATEGORY_NAMES[slug]) {
      title = SPECIAL_CATEGORY_NAMES[slug];
    } else {
      // Try to get category name from API
      const categories = await getCategories();
      const category = categories.find((cat: Category) => cat.slug === slug);

      // Use category name from API or format from slug if not found
      title = category
        ? category.name
        : slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
  }

  // Prepare initial data for client component
  const initialData = {
    movies: movies || [],
    pagination: pagination || { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    title: title || `Phim ${slug}`,
    slug,
  };

  return (
    <>
      <BreadcrumbSchema items={[{ name: initialData.title, url: `/danh-muc/${slug}` }]} />
      <CategoryClientPage initialData={initialData} isYear={isYear} />
    </>
  );
}
