'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
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
        </div>
      </body>
    </html>
  );
}
