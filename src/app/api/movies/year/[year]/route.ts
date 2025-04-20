import { NextRequest, NextResponse } from 'next/server';
import { getMoviesByYear } from '@/lib/api/services';

export async function GET(request: NextRequest, { params }: { params: { year: string } }) {
  const { year } = params;
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
