import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';

// Tạo metadata động cho trang tìm kiếm
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { keyword?: string };
}): Promise<Metadata> {
  const keyword = searchParams.keyword || '';

  let title;
  let description;

  if (keyword) {
    title = `Kết quả tìm kiếm cho "${keyword}" - ${SITE_NAME}`;
    description = `Xem các bộ phim liên quan đến từ khóa "${keyword}". Tổng hợp phim hay nhất, cập nhật mới nhất.`;
  } else {
    title = `Tìm kiếm phim - ${SITE_NAME}`;
    description = `Tìm kiếm phim lẻ, phim bộ, phim hoạt hình và các chương trình truyền hình yêu thích của bạn.`;
  }

  return {
    title,
    description,
    keywords: keyword
      ? `${keyword}, phim hay, phim online, phim HD, phim mới`
      : 'tìm kiếm phim, phim hay, phim online, phim HD',
    openGraph: {
      title,
      description,
      url: keyword
        ? `${DOMAIN}/tim-kiem?keyword=${encodeURIComponent(keyword)}`
        : `${DOMAIN}/tim-kiem`,
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
      canonical: keyword
        ? `${DOMAIN}/tim-kiem?keyword=${encodeURIComponent(keyword)}`
        : `${DOMAIN}/tim-kiem`,
    },
  };
}
