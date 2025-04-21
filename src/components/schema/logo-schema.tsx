'use client';

import { DOMAIN, SITE_NAME } from '@/lib/constants';
import Script from 'next/script';

export function LogoSchema() {
  // Tạo dữ liệu có cấu trúc đặc biệt cho logo theo hướng dẫn của Google
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: DOMAIN,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${DOMAIN}/images/logo.png`,
        width: 849,
        height: 219,
      },
    },
  };

  return (
    <Script id="logo-schema" type="application/ld+json">
      {JSON.stringify(schemaData)}
    </Script>
  );
}
