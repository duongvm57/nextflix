import { NextRequest, NextResponse } from 'next/server';

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

    console.log('Fetching URL:', urlParam);

    // Construct URL parts manually to avoid URL parsing issues
    const baseUrl = 'https://phimapi.com';
    const path = urlParam.replace(/^https?:\/\/phimapi\.com/i, '');

    // Make sure path starts with a slash
    const formattedPath = path.startsWith('/') ? path : `/${path}`;

    // Construct the final URL
    const finalUrl = `${baseUrl}${formattedPath}`;

    console.log('Final URL:', finalUrl);

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    // Return a more useful error response
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: urlParam,
        // Return empty data structure to prevent client-side errors
        data: {
          items: [],
          params: {
            pagination: {
              totalItems: 0,
              totalItemsPerPage: 20,
              currentPage: 1,
              totalPages: 0,
            },
          },
          APP_DOMAIN_CDN_IMAGE: '',
        },
      },
      { status: 500 }
    );
  }
}
