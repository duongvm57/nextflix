import { NextRequest, NextResponse } from 'next/server';
import { CACHE_CONFIG } from '@/lib/config/cache-config';

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url');

  if (!urlParam) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Only allow requests to phimapi.com domain for security
    if (!urlParam.includes('phimapi.com')) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 403 });
    }

    // Determine if this is a static route that should be cached
    const isStaticRoute =
      urlParam.includes('/categories') ||
      urlParam.includes('/countries') ||
      urlParam.includes('/genres');

    console.log('Fetching URL:', urlParam);

    // Construct URL parts manually to avoid URL parsing issues
    const baseUrl = 'https://phimapi.com';
    const path = urlParam.replace(/^https?:\/\/phimapi\.com/i, '');
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = `${baseUrl}${formattedPath}`;

    console.log('Final URL:', finalUrl);

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Use appropriate cache strategy based on route type
      cache: isStaticRoute ? 'force-cache' : 'no-store',
      next: isStaticRoute
        ? {
            revalidate: CACHE_CONFIG.SERVER.CATEGORIES,
            tags: ['categories', 'countries'],
          }
        : undefined,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Add appropriate cache headers
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      isStaticRoute
        ? `public, max-age=${CACHE_CONFIG.HTTP.STATIC}, s-maxage=${CACHE_CONFIG.SERVER.CATEGORIES}`
        : 'no-cache'
    );

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
