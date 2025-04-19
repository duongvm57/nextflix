import { NextRequest, NextResponse } from 'next/server';
import { movieService } from '@/lib/services/api';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  try {
    const result = await movieService.getMoviesByCategory(slug, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching movies by category:', error);
    return NextResponse.json(
      {
        data: [],
        pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: page, totalPages: 1 },
      },
      { status: 500 }
    );
  }
}
