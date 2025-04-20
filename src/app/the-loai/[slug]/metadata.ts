import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { getCategories } from '@/services/phimapi';
import { Category } from '@/types';

// Tạo metadata động cho trang thể loại
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  // Get category name from API
  const categories = await getCategories();
  const category = categories.find((c: Category) => c.slug === slug);

  // Use category name from API or format from slug if not found
  const categoryName = category
    ? category.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  // Tiêu đề thể loại mặc định
  const title = `Danh sách phim ${categoryName} - tổng hợp phim ${categoryName}`;

  // Description thể loại mặc định
  const description = `Phim ${categoryName} mới nhất tuyển chọn hay nhất. Top những bộ phim ${categoryName} đáng để bạn cày 2025`;

  // Keywords thể loại mặc định
  const keywords = `Xem phim ${categoryName},Phim ${categoryName} mới,Phim ${categoryName} 2025,phim hay`;

  // Thông tin bổ sung
  const additionalInfo = `Thông tin: ${categoryName}`;

  return {
    title,
    description: `${description}\n${additionalInfo}`,
    keywords,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/the-loai/${slug}`,
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
      canonical: `${DOMAIN}/the-loai/${slug}`,
    },
  };
}
