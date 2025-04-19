import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CacheStatusWrapper } from '@/components/ui/cache-status-wrapper';
import { LoadingProvider } from '@/providers/loading-provider';
import { Suspense } from 'react';
import { SITE_NAME, SITE_DESCRIPTION, DOMAIN } from '@/lib/constants';
import { WebsiteSchema } from '@/components/schema/website-schema';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Removed font declarations to avoid hydration issues

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(DOMAIN),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    generator: 'Next.js',
    keywords: ['phim online', 'phim HD', 'phim lẻ', 'phim bộ', 'phim vietsub', 'phim thuyết minh', 'phim chiếu rạp'],
    referrer: 'origin-when-cross-origin',
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: DOMAIN,
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: DOMAIN,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/apple-touch-icon.png',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className="antialiased bg-black text-white min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        {/* Thêm Schema.org structured data cho website */}
        <WebsiteSchema />

        <Suspense fallback={<div>Loading...</div>}>
          <LoadingProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CacheStatusWrapper />
          </LoadingProvider>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
