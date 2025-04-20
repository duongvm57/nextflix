import { movieService } from '@/lib/services/api';
import { getCategories } from '@/services/phimapi';
import { CategoryClientPage } from './client-page';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { Category, PaginatedResponse, Movie } from '@/types';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

async function getMoviesByCategory(
  slug: string,
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  try {
    return await movieService.getMoviesByCategory(slug, page);
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

async function getMoviesByYear(year: string, page: number = 1): Promise<PaginatedResponse<Movie>> {
  try {
    return await movieService.getMoviesByYear(year, page);
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

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  // Check if slug is a year (4 digits)
  const isYear = /^\d{4}$/.test(slug);

  let movies;
  let pagination;
  let title;

  if (isYear) {
    // Get movies by year
    const result = await getMoviesByYear(slug, page);
    movies = result.data;
    pagination = result.pagination;
    title = `Phim năm ${slug}`;
  } else {
    // Get movies by category
    const result = await getMoviesByCategory(slug, page);
    movies = result.data;
    pagination = result.pagination;

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
    movies,
    pagination,
    title,
    slug,
  };

  return (
    <>
      <BreadcrumbSchema items={[{ name: title, url: `/danh-muc/${slug}` }]} />
      <CategoryClientPage initialData={initialData} isYear={isYear} />
    </>
  );
}
