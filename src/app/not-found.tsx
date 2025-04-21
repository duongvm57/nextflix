'use client';

import { Button } from '@/components/ui/button';
import { MenuLink } from '@/components/ui/menu-link';
import { useEffect } from 'react';
import { logNavigationState } from '@/utils/navigation-debug';

export default function NotFound() {
  // Log navigation state to help debug why we're on the 404 page
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      logNavigationState('404_PAGE');
    }
  }, []);

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-gray-400">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <MenuLink href="/">
        <Button variant="primary" size="lg">
          Back to Home
        </Button>
      </MenuLink>
    </div>
  );
}
