import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByYear } from '@/lib/api/services';

export async function GET(request: NextRequest, context: { params: { year: string } }) {
  // Use Promise.resolve to handle the params
  const params = await Promise.resolve(context.params);
  const year = params.year;

  // Get search params from URL
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  try {
    const result = await getMoviesByYear(year, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching movies by year:', error);
    return NextResponse.json(
      {
        data: [],
        pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: page, totalPages: 1 },
      },
      { status: 500 }
    );
  }
}
