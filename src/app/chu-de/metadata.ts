import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';

export function generateMetadata(): Metadata {
  const title = 'Tất cả chủ đề | ' + SITE_NAME;
  const description =
    'Khám phá tất cả các chủ đề phim và chương trình truyền hình trên ' + SITE_NAME;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/chu-de`,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    alternates: {
      canonical: `${DOMAIN}/chu-de`,
    },
  };
}
