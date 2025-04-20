import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByCategory } from '@/lib/api/services';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const { slug } = params;

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
    console.error(`Error in category API route for ${params.slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
