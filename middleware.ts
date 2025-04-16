import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './src/i18n/config';

export function middleware(request: NextRequest) {
  // Get the locale from the cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  // Check if the pathname has a locale prefix
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Check if the pathname already has a locale prefix
  if (pathnameHasLocale) {
    // If it does, we'll keep it as is and not redirect
    // This ensures that the locale in the URL matches what's used for rendering
    return NextResponse.next();
  }

  // If there's no locale in the pathname, we'll rewrite the request
  // to include the locale from the cookie or the default locale
  const locale = cookieLocale && locales.includes(cookieLocale as any)
    ? cookieLocale
    : defaultLocale;

  // Rewrite the URL to include the locale
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  // Copy all query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });

  // Create a response that rewrites the URL
  const response = NextResponse.rewrite(newUrl);

  // Set the locale cookie
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31536000, // 1 year
    sameSite: 'strict'
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
