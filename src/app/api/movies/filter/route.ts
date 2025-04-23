import { NextRequest, NextResponse } from 'next/server';
import { getFilteredMovies } from '@/lib/api';
import { logger } from '@/utils/logger';

/**
 * API endpoint để lọc phim dựa trên route hiện tại và các tham số filter
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy các tham số từ URL
    const { searchParams } = new URL(request.url);

    // Lấy thông tin route hiện tại
    const routeType = searchParams.get('routeType') || '';
    const routeSlug = searchParams.get('routeSlug') || '';
    const page = parseInt(searchParams.get('page') || '1');

    // Xây dựng object filters từ searchParams
    const filters: Record<string, string> = {};

    // Các tham số filter có thể có
    const possibleParams = [
      'type', 'category', 'country', 'year',
      'sort_field', 'sort_type', 'sort_lang', 'limit'
    ];

    // Thêm các tham số filter nếu có
    possibleParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        filters[param] = value;
      }
    });

    logger.debug(`[API Filter] Filtering movies for ${routeType}/${routeSlug} with params:`, filters);
    console.log(`[API Filter] Filtering movies for ${routeType}/${routeSlug} with params:`, filters);

    // Xử lý đặc biệt cho danh-muc/phim-le với type=hoat-hinh
    if (routeType === 'danh-muc' && routeSlug === 'phim-le' && filters.type === 'hoat-hinh') {
      console.log('[API Filter] Special case: danh-muc/phim-le with type=hoat-hinh');
      // Đổi routeType thành the-loai và routeSlug thành hoat-hinh
      routeType = 'the-loai';
      routeSlug = 'hoat-hinh';
      // Giữ lại type=phim-le
      filters.type = 'phim-le';
    }

    // Xử lý đặc biệt cho danh-muc/phim-bo với type=hoat-hinh
    if (routeType === 'danh-muc' && routeSlug === 'phim-bo' && filters.type === 'hoat-hinh') {
      console.log('[API Filter] Special case: danh-muc/phim-bo with type=hoat-hinh');
      // Đổi routeType thành the-loai và routeSlug thành hoat-hinh
      routeType = 'the-loai';
      routeSlug = 'hoat-hinh';
      // Giữ lại type=phim-bo
      filters.type = 'phim-bo';
    }

    // Xử lý đặc biệt cho danh-muc/phim-le với country=nhat-ban
    if (routeType === 'danh-muc' && routeSlug === 'phim-le' && filters.country) {
      console.log(`[API Filter] Special case: danh-muc/phim-le with country=${filters.country}`);
      // Đổi routeType thành quoc-gia và routeSlug thành country
      const country = filters.country;
      routeType = 'quoc-gia';
      routeSlug = country;
      // Giữ lại type=phim-le
      filters.type = 'phim-le';
      // Xóa country vì đã được sử dụng trong routeSlug
      delete filters.country;
    }

    // Gọi hàm filter thông minh
    const result = await getFilteredMovies(routeType, routeSlug, filters, page);
    console.log('[API Filter] Filter result:', {
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      itemCount: result.data.length
    });

    // Trả về kết quả
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API Filter] Error filtering movies:', error);
    logger.error('[API Filter] Error filtering movies:', error);

    // Trả về response lỗi
    return NextResponse.json(
      {
        data: [],
        pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
      },
      { status: 500 }
    );
  }
}
