import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Store RSC requests for debugging
const rscRequests: {
  timestamp: number;
  url: string;
  params: string;
}[] = [];

// Maximum number of requests to store
const MAX_REQUESTS = 100;

// Store RSC cache hits to avoid duplicate requests
const rscCacheHits = new Map<string, number>();

// Popular genres that should be prefetched together
const POPULAR_GENRES = [
  'hanh-dong',
  'tinh-cam',
  'hai-huoc',
  'co-trang',
  'tam-ly',
  'kinh-di',
  'vien-tuong',
];

// Check if a path is a genre path
function isGenrePath(path: string): boolean {
  // Check if path is a direct genre slug
  if (POPULAR_GENRES.some(genre => path === `/${genre}`)) {
    return true;
  }

  // Check if path is in /the-loai/[slug] format
  if (path.startsWith('/the-loai/')) {
    const genreSlug = path.split('/').pop();
    return POPULAR_GENRES.includes(genreSlug || '');
  }

  return false;
}

// Middleware function
export function middleware(request: NextRequest) {
  // Only process RSC requests
  if (request.headers.get('RSC') === '1' || request.url.includes('_rsc=')) {
    // Extract the URL and parameters
    const url = new URL(request.url);
    const pathname = url.pathname;
    const params = url.searchParams.toString();

    // Get referer to determine current page
    const referer = request.headers.get('referer') || '';
    const refererUrl = referer ? new URL(referer) : null;
    const refererPath = refererUrl?.pathname || '';

    // Check if this is a genre request while viewing another genre
    if (isGenrePath(pathname) && isGenrePath(refererPath) && pathname !== refererPath) {
      console.log(`[MIDDLEWARE] Detected cross-genre request: ${pathname} while on ${refererPath}`);

      // If we're on a genre page and requesting another genre, use batch API instead
      // This helps avoid individual RSC requests for each genre
      const genreSlug = pathname.includes('/the-loai/')
        ? pathname.split('/').pop()
        : pathname.substring(1);

      console.log(`[MIDDLEWARE] Redirecting to batch API for genre: ${genreSlug}`);

      // Return a minimal response that indicates we should use batch API
      return new NextResponse(
        JSON.stringify({
          cached: true,
          useBatchApi: true,
          genre: genreSlug,
          timestamp: Date.now(),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RSC-Cache': 'REDIRECTED',
            'Cache-Control':
              'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000',
          },
        }
      );
    }

    // Create a cache key
    const cacheKey = `${pathname}?${params}`;

    // Check if this request was recently processed
    const now = Date.now();
    const lastHit = rscCacheHits.get(cacheKey);

    if (lastHit && now - lastHit < 5000) {
      // 5 seconds cache
      // This is a duplicate request, return empty response
      console.log(`[MIDDLEWARE] Blocked duplicate RSC request: ${cacheKey}`);

      // Return a minimal response
      return new NextResponse(
        JSON.stringify({
          cached: true,
          timestamp: now,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-RSC-Cache': 'HIT',
            'Cache-Control':
              'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000',
          },
        }
      );
    }

    // Update the cache hit timestamp
    rscCacheHits.set(cacheKey, now);

    // Clean up old cache entries
    if (rscCacheHits.size > 100) {
      // Remove entries older than 10 seconds
      for (const [key, timestamp] of rscCacheHits.entries()) {
        if (now - timestamp > 10000) {
          rscCacheHits.delete(key);
        }
      }
    }

    // Log the request
    rscRequests.unshift({
      timestamp: now,
      url: pathname,
      params,
    });

    // Keep only the most recent requests
    if (rscRequests.length > MAX_REQUESTS) {
      rscRequests.pop();
    }

    // Add cache headers to RSC responses
    const response = NextResponse.next();

    // Add cache headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000'
    );
    response.headers.set('X-RSC-Cache', 'MISS');

    return response;
  }

  // Handle debug endpoint
  if (request.nextUrl.pathname === '/api/rsc-debug') {
    return NextResponse.json({
      requests: rscRequests,
      count: rscRequests.length,
      timestamp: Date.now(),
    });
  }

  // Continue for non-RSC requests
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all RSC requests
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
