'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import Script from 'next/script';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error('[GLOBAL_ERROR] Critical error occurred:', error);

    // Only log detailed debug info in development mode
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Log all session storage data
      try {
        const sessionData = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            (sessionData as Record<string, string | null>)[key] = sessionStorage.getItem(key);
          }
        }
        console.log('[GLOBAL_ERROR] Session storage data:', sessionData);
      } catch (e) {
        console.error('[GLOBAL_ERROR] Error accessing session storage:', e);
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <Script
          id="navigation-debug"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Log navigation state for debugging
              (function() {
                try {
                  console.group('[GLOBAL_ERROR] Navigation State');
                  console.log('Current path:', window.location.pathname);
                  console.log('Full URL:', window.location.href);
                  console.log('Referrer:', document.referrer);

                  // Log session storage data
                  const sessionData = {};
                  for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key) {
                      sessionData[key] = sessionStorage.getItem(key);
                    }
                  }
                  console.log('Session storage data:', sessionData);
                  console.groupEnd();
                } catch (error) {
                  console.error('[GLOBAL_ERROR] Error logging navigation state:', error);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">Critical Error</h1>
          <h2 className="mb-6 text-2xl font-semibold">Something went seriously wrong!</h2>
          <p className="mb-8 max-w-md text-gray-400">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <Button variant="primary" size="lg" onClick={() => reset()}>
            Try again
          </Button>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
