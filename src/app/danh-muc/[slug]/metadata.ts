import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';

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
  let keywords;
  let additionalInfo;

  if (isYear) {
    title = `Danh sách phim năm ${slug} - tổng hợp phim năm ${slug}`;
    description = `Phim năm ${slug} mới nhất tuyển chọn hay nhất. Top những bộ phim năm ${slug} đáng để bạn cày 2025`;
    keywords = `Xem phim năm ${slug},Phim năm ${slug} mới,Phim năm ${slug} 2025,phim hay`;
    additionalInfo = `Thông tin: Năm ${slug}`;
  } else {
    // First check if it's a special category
    if (SPECIAL_CATEGORY_NAMES[slug]) {
      const categoryName = SPECIAL_CATEGORY_NAMES[slug];
      title = `Danh sách ${categoryName} - tổng hợp ${categoryName}`;
      description =
        SPECIAL_CATEGORY_DESCRIPTIONS[slug] ||
        `Phim ${categoryName} mới nhất tuyển chọn hay nhất. Top những bộ ${categoryName} đáng để bạn cày 2025`;
      keywords = `Xem ${categoryName},${categoryName} mới,${categoryName} 2025,phim hay`;
      additionalInfo = `Thông tin: ${categoryName}`;
    } else {
      // Try to get category name from API
      const categories = await getCategories();
      const category = categories.find((cat: Category) => cat.slug === slug);

      // Use category name from API or format from slug if not found
      const categoryName = category
        ? category.name
        : slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

      title = `Danh sách phim ${categoryName} - tổng hợp phim ${categoryName}`;
      description = `Phim ${categoryName} mới nhất tuyển chọn hay nhất. Top những bộ phim ${categoryName} đáng để bạn cày 2025`;
      keywords = `Xem phim ${categoryName},Phim ${categoryName} mới,Phim ${categoryName} 2025,phim hay`;
      additionalInfo = `Thông tin: ${categoryName}`;
    }
  }

  return {
    title,
    description: `${description}\n${additionalInfo}`,
    keywords,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/danh-muc/${slug}`,
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
      canonical: `${DOMAIN}/danh-muc/${slug}`,
    },
  };
}
