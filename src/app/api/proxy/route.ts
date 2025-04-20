import { NextRequest, NextResponse } from 'next/server';
import { CACHE_CONFIG } from '@/lib/config/cache-config';
import { proxyAPIRequest, CACHED_ENDPOINTS } from '@/lib/api/services';
import { logger } from '@/utils/logger';

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
    const isStaticRoute = CACHED_ENDPOINTS.some(endpoint => urlParam.includes(endpoint));

    logger.debug('Fetching URL:', urlParam);

    // Use proxyAPIRequest from service layer
    const data = await proxyAPIRequest(urlParam, isStaticRoute);

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
    logger.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
