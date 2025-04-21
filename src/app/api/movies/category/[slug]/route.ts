import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByCategory } from '@/lib/api/services';

export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  try {
    // Use Promise.resolve to handle the params
    const params = await Promise.resolve(context.params);
    const slug = params.slug;

    // Get search params from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');

    const response = await getMoviesByCategory(slug, page);

    // If no data, return empty response with 404
    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        {
          data: [],
          pagination: {
            totalItems: 0,
            totalItemsPerPage: 20,
            currentPage: page,
            totalPages: 0,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Error in category API route for ${slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
