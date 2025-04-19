import { movieService } from '@/lib/services/api';
import { getCategories } from '@/services/phimapi';
import { CategoryClientPage } from './client-page';
import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';

async function getMoviesByCategory(slug: string, page: number = 1) {
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

async function getMoviesByYear(year: string, page: number = 1) {
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

// Map of special category descriptions
const SPECIAL_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'phim-le':
    'Tổng hợp các bộ phim lẻ hay nhất, phim điện ảnh chất lượng cao với đầy đủ phụ đề và thuyết minh tiếng Việt',
  'phim-bo': 'Tổng hợp các bộ phim bộ, phim truyền hình nhiều tập hay nhất, cập nhật nhanh nhất',
  'hoat-hinh': 'Tổng hợp phim hoạt hình, anime Nhật Bản và phim hoạt hình 3D mới nhất',
  'phim-vietsub': 'Tổng hợp phim có phụ đề tiếng Việt chất lượng cao',
  'phim-thuyet-minh': 'Tổng hợp phim có thuyết minh tiếng Việt chất lượng cao',
  'phim-long-tieng': 'Tổng hợp phim có lồng tiếng Việt chất lượng cao',
  'tv-shows': 'Tổng hợp các chương trình truyền hình, TV Shows hấp dẫn nhất',
};

// Tạo metadata động cho trang danh sách phim
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Check if slug is a year (4 digits)
  const isYear = /^\d{4}$/.test(slug);

  let title;
  let description;

  if (isYear) {
    title = `Phim năm ${slug} - ${SITE_NAME}`;
    description = `Tổng hợp các bộ phim hay nhất được sản xuất trong năm ${slug}. Xem phim năm ${slug} online với chất lượng HD, phụ đề đầy đủ.`;
  } else {
    // First check if it's a special category
    if (SPECIAL_CATEGORY_NAMES[slug]) {
      title = `${SPECIAL_CATEGORY_NAMES[slug]} - ${SITE_NAME}`;
      description =
        SPECIAL_CATEGORY_DESCRIPTIONS[slug] ||
        `Tổng hợp ${SPECIAL_CATEGORY_NAMES[slug]} hay nhất, cập nhật mới nhất.`;
    } else {
      // Try to get category name from API
      const categories = await getCategories();
      const category = categories.find(cat => cat.slug === slug);

      // Use category name from API or format from slug if not found
      const categoryName = category
        ? category.name
        : slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

      title = `${categoryName} - ${SITE_NAME}`;
      description = `Tổng hợp phim ${categoryName} hay nhất, cập nhật mới nhất. Xem phim ${categoryName} online với chất lượng HD, phụ đề đầy đủ.`;
    }
  }

  return {
    title,
    description,
    keywords: `${title.replace(` - ${SITE_NAME}`, '')}, phim hay, phim online, phim HD, phim mới`,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/categories/${slug}`,
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
      canonical: `${DOMAIN}/categories/${slug}`,
    },
  };
}

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
      return Response.redirect(`/categories/${slug}?page=${pagination.totalPages}`);
    }

    // First check if it's a special category
    if (SPECIAL_CATEGORY_NAMES[slug]) {
      title = SPECIAL_CATEGORY_NAMES[slug];
    } else {
      // Try to get category name from API
      const categories = await getCategories();
      const category = categories.find(cat => cat.slug === slug);

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
      <BreadcrumbSchema
        items={[
          { name: isYear ? 'Năm' : 'Thể loại', url: '/categories' },
          { name: title, url: `/categories/${slug}` },
        ]}
      />
      <CategoryClientPage initialData={initialData} isYear={isYear} />
    </>
  );
}
