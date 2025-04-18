import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CacheStatusWrapper } from '@/components/ui/cache-status-wrapper';
import { LoadingProvider } from '@/providers/loading-provider';
import { Suspense } from 'react';

// Removed font declarations to avoid hydration issues

export function generateMetadata(): Metadata {
  return {
    title: 'Nextflix',
    description: 'Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD',
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: '/favicon.svg',
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
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className="antialiased bg-black text-white min-h-screen flex flex-col"
        suppressHydrationWarning
      >
        <Suspense fallback={<div>Loading...</div>}>
          <LoadingProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CacheStatusWrapper />
          </LoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
