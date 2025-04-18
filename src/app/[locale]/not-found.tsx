import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getTranslations } from '@/i18n/config';

export default function NotFound() {
  // In not-found.tsx, we can't access params directly
  // So we'll use a hardcoded locale
  const locale = 'en';

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
      <h2 className="mb-6 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-gray-400">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <Link href={`/${locale}`}>
        <Button variant="primary" size="lg">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
