'use client';

import { DOMAIN, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import Script from 'next/script';

export function OrganizationSchema() {
  // Tạo dữ liệu có cấu trúc cho tổ chức
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: DOMAIN,
    logo: {
      '@type': 'ImageObject',
      url: `${DOMAIN}/images/logo.png`,
      width: 849,
      height: 219,
      caption: SITE_NAME,
    },
    description: SITE_DESCRIPTION,
    sameAs: [
      // Thêm các liên kết mạng xã hội nếu có
    ],
  };

  return (
    <Script id="organization-schema" type="application/ld+json">
      {JSON.stringify(schemaData)}
    </Script>
  );
}
