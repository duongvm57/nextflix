'use client';

import { DOMAIN, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import Script from 'next/script';

export function WebsiteSchema() {
  // Tạo dữ liệu có cấu trúc cho website
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: DOMAIN,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DOMAIN}/search?keyword={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script id="website-schema" type="application/ld+json">
      {JSON.stringify(schemaData)}
    </Script>
  );
}
