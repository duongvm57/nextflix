import HomeClientPage from './client-page';
import { Metadata } from 'next';
import { DOMAIN, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS } from '@/lib/constants';

// Tạo metadata cho trang chủ
export function generateMetadata(): Metadata {
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: DOMAIN,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    alternates: {
      canonical: DOMAIN,
    },
  };
}

export default function Home() {
  return <HomeClientPage />;
}
