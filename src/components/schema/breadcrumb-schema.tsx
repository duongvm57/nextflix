'use client';

import { DOMAIN, SITE_NAME } from '@/lib/constants';
import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  // Tạo dữ liệu có cấu trúc cho breadcrumbs
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: DOMAIN,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${DOMAIN}${item.url}`,
      })),
    ],
  };

  return (
    <Script id="breadcrumb-schema" type="application/ld+json">
      {JSON.stringify(schemaData)}
    </Script>
  );
}
