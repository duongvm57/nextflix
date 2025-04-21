import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CacheStatusWrapper } from '@/components/ui/cache-status-wrapper';

import { LoadingProvider } from '@/providers/loading-provider';
import { YearWrapper } from '@/components/year-wrapper';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SITE_NAME, SITE_DESCRIPTION, DOMAIN } from '@/lib/constants';
import { WebsiteSchema } from '@/components/schema/website-schema';
import { SpeedInsights } from '@vercel/speed-insights/next';
// Removed prefetch imports
import Script from 'next/script';

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
    keywords: [
      'phim online',
      'phim HD',
      'phim lẻ',
      'phim bộ',
      'phim vietsub',
      'phim thuyết minh',
      'phim chiếu rạp',
    ],
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
  // Prefetch removed
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Script
          id="bundle-optimizer-loader"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Khởi tạo cache từ sessionStorage
              (function() {
                try {
                  // Tạo container cho optimizer
                  const container = document.createElement('div');
                  container.id = 'bundle-optimizer-container';
                  container.style.display = 'none';
                  document.body.appendChild(container);

                  // Đánh dấu các trang đã prefetch
                  window.__PREFETCHED_PAGES = new Set();
                  window.__PREFETCHED_MOVIES = new Set();
                  window.__RSC_CACHE = {};

                  // Fix navigation issues with links redirecting to homepage
                  if (typeof window !== 'undefined') {
                    // Check if we're on the home page but should be somewhere else
                    const currentPath = window.location.pathname;
                    const targetUrl = sessionStorage.getItem('targetUrl');
                    const lastUrl = sessionStorage.getItem('lastUrl');

                    // Only log in development mode
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[NAVIGATION_DEBUG] Current path:', currentPath);
                      console.log('[NAVIGATION_DEBUG] Target URL:', targetUrl);
                      console.log('[NAVIGATION_DEBUG] Last URL:', lastUrl);
                    }

                    // If we're on the home page but should be on another page
                    if (currentPath === '/' && targetUrl && targetUrl !== '/') {
                      // Only log in development mode
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[NAVIGATION_FIX] Detected incorrect navigation to home page');
                        console.log('[NAVIGATION_FIX] Should be on:', targetUrl, 'Last URL was:', lastUrl);
                      }

                      // Check if we came from a watch page or any other page
                      if (lastUrl) {
                        // Use replace instead of href to avoid adding to browser history
                        window.location.replace(targetUrl);
                      }
                    }
                  }

                  // Chặn các yêu cầu RSC trùng lặp
                  const originalFetch = window.fetch;
                  window.fetch = function(input, init) {
                    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

                    // Kiểm tra xem có phải là yêu cầu RSC không
                    if (url.includes('_rsc=')) {
                      const urlObj = new URL(url, window.location.origin);
                      const path = urlObj.pathname;

                      // Kiểm tra xem đã prefetch chưa
                      if (window.__PREFETCHED_PAGES.has(path)) {
                        // Only log in development mode
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[OPTIMIZER] Blocked duplicate RSC request:', path);
                        }
                        return Promise.resolve(new Response('{}', {
                          status: 200,
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        }));
                      }

                      // Đánh dấu đã prefetch
                      window.__PREFETCHED_PAGES.add(path);

                      // Kiểm tra xem có phải là yêu cầu phim không
                      if (path.startsWith('/watch/')) {
                        const movieSlug = path.replace('/watch/', '');
                        if (window.__PREFETCHED_MOVIES.has(movieSlug)) {
                          // Only log in development mode
                          if (process.env.NODE_ENV === 'development') {
                            console.log('[OPTIMIZER] Blocked duplicate movie request:', movieSlug);
                          }
                          return Promise.resolve(new Response('{}', {
                            status: 200,
                            headers: {
                              'Content-Type': 'application/json'
                            }
                          }));
                        }
                        window.__PREFETCHED_MOVIES.add(movieSlug);
                      }
                    }

                    // Gọi fetch gốc
                    return originalFetch.call(window, input, init);
                  };
                } catch (error) {
                  console.error('[OPTIMIZER] Error initializing:', error);
                }
              })();
            `,
          }}
        />

        <Script
          id="navigation-fix"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Fix navigation issues with links redirecting to homepage
              (function() {
                try {
                  // Listen for navigation events
                  window.addEventListener('popstate', function() {
                    // Store the current URL when navigating with back/forward buttons
                    sessionStorage.setItem('navigationMethod', 'popstate');
                    sessionStorage.setItem('currentPath', window.location.pathname);
                    // Only log in development mode
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[NAVIGATION_POPSTATE] Current path:', window.location.pathname);
                    }
                  });

                  // Check for navigation issues on page load
                  document.addEventListener('DOMContentLoaded', function() {
                    const currentPath = window.location.pathname;
                    const targetUrl = sessionStorage.getItem('targetUrl');
                    const lastUrl = sessionStorage.getItem('lastUrl');
                    const navigationMethod = sessionStorage.getItem('navigationMethod');

                    // Only log in development mode
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[NAVIGATION_CHECK] Current path:', currentPath);
                      console.log('[NAVIGATION_CHECK] Target URL:', targetUrl);
                      console.log('[NAVIGATION_CHECK] Last URL:', lastUrl);
                      console.log('[NAVIGATION_CHECK] Navigation method:', navigationMethod);
                    }

                    // If we're on the home page but should be on another page
                    if (currentPath === '/' && targetUrl && targetUrl !== '/') {
                      // Only log in development mode
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[NAVIGATION_FIX] Detected incorrect navigation to home page');
                        console.log('[NAVIGATION_FIX] Redirecting from home to:', targetUrl);
                      }

                      // Redirect to the intended page
                      window.location.replace(targetUrl);
                    }

                    // Also check for other navigation issues
                    if (currentPath !== targetUrl && targetUrl && !currentPath.includes('/xem/')) {
                      // Only log in development mode
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[NAVIGATION_CHECK] Current path does not match target URL');
                        console.log('[NAVIGATION_CHECK] This might indicate a navigation issue');
                      }
                    }
                  });

                  // Also listen for page visibility changes which might indicate navigation issues
                  document.addEventListener('visibilitychange', function() {
                    if (document.visibilityState === 'visible') {
                      const currentPath = window.location.pathname;
                      const targetUrl = sessionStorage.getItem('targetUrl');

                      // If we're on the home page but should be somewhere else
                      if (currentPath === '/' && targetUrl && targetUrl !== '/') {
                        // Only log in development mode
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[NAVIGATION_VISIBILITY] Detected incorrect navigation to home page');
                          console.log('[NAVIGATION_VISIBILITY] Redirecting to:', targetUrl);
                        }
                        window.location.replace(targetUrl);
                      }
                    }
                  });
                } catch (error) {
                  console.error('[NAVIGATION_FIX] Error:', error);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased text-white min-h-screen flex flex-col" suppressHydrationWarning>
        {/* Thêm Schema.org structured data cho website */}
        <WebsiteSchema />

        <Suspense fallback={<LoadingSpinner fullPage={true} />}>
          <YearWrapper>
            <LoadingProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <CacheStatusWrapper />
            </LoadingProvider>
          </YearWrapper>
        </Suspense>
        <SpeedInsights />
        {/* Bundle Optimizer is loaded via a script tag */}
      </body>
    </html>
  );
}
