import { NextRequest, NextResponse } from 'next/server';
import { getCategories, getCountries, getNewMovies, getMoviesByCategory } from '@/services/phimapi';
import { CACHE_CONFIG } from '@/lib/config/cache-config';
import { clientCache } from '@/lib/cache/client-cache';
import { logApiCall } from '../debug/route';
import { revalidateTag } from 'next/cache';
import type { Category, Country, Movie, PaginatedResponse } from '@/types';

/**
 * Batch API endpoint to fetch multiple resources in a single request
 * This reduces the number of separate API calls needed when navigating
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resources = searchParams.get('resources')?.split(',') || [];
  const includePopularGenres = searchParams.get('includePopularGenres') === 'true';

  // Các thể loại phim phổ biến
  const popularGenres = [
    'hanh-dong',
    'tinh-cam',
    'hai-huoc',
    'co-trang',
    'tam-ly',
    'kinh-di',
    'vien-tuong',
  ];

  console.log(`[BATCH API] Received request for resources: ${resources.join(', ')}`);

  // Generate a cache key for this specific request
  const cacheKey = `batch_api_${resources.sort().join('_')}_${searchParams.toString()}`;

  try {
    // Check server-side cache first
    const cachedResult = clientCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[BATCH API] Cache hit for key: ${cacheKey}`);

      // Log this API call with cache hit
      logApiCall(request.url, 'GET', 'HIT');

      // Add cache headers for better performance
      const headers = new Headers();
      headers.set(
        'Cache-Control',
        `public, max-age=${CACHE_CONFIG.HTTP.BATCH}, s-maxage=${CACHE_CONFIG.SERVER.BATCH}, stale-while-revalidate=86400`
      );
      headers.set('X-Cache', 'HIT');

      return NextResponse.json(cachedResult, { headers });
    }

    console.log(`[BATCH API] Cache miss for key: ${cacheKey}, fetching data`);

    // Log this API call with cache miss
    logApiCall(request.url, 'GET', 'MISS');

    // Định nghĩa kiểu dữ liệu cho kết quả
    interface IBatchResult {
      categories?: Category[];
      countries?: Country[];
      newMovies?: PaginatedResponse<Movie>;
      genres?: Record<string, PaginatedResponse<Movie>>;
    }

    const result: IBatchResult = {
      genres: {},
    };
    const promises = [];

    // Add promises for each requested resource
    if (resources.includes('categories')) {
      console.log('[BATCH API] Fetching categories');
      promises.push(
        getCategories().then(data => {
          result.categories = data as Category[];
          console.log(`[BATCH API] Got ${Array.isArray(data) ? data.length : 0} categories`);
        })
      );
    }

    if (resources.includes('countries')) {
      console.log('[BATCH API] Fetching countries');
      promises.push(
        getCountries().then(data => {
          result.countries = data as Country[];
          console.log(`[BATCH API] Got ${Array.isArray(data) ? data.length : 0} countries`);
        })
      );
    }

    // Hỗ trợ cả 'newMovies' và 'new_movies' để đảm bảo tương thích ngược
    if (resources.includes('newMovies') || resources.includes('new_movies')) {
      const page = parseInt(searchParams.get('page') || '1');
      console.log(`[BATCH API] Fetching new movies for page ${page}`);
      promises.push(
        getNewMovies(page).then(data => {
          result.newMovies = data;
          console.log(`[BATCH API] Got ${data.data.length} new movies`);
        })
      );
    }

    // Nếu yêu cầu bao gồm các thể loại phổ biến
    if (includePopularGenres) {
      console.log('[BATCH API] Fetching popular genres data');

      // Tạo một mảng promises cho mỗi thể loại phổ biến
      const genrePromises = popularGenres.map(async (genre: string) => {
        try {
          const data = await getMoviesByCategory(genre, 1, { limit: '12' });
          if (result.genres) result.genres[genre] = data;
          console.log(`[BATCH API] Got ${data.data.length} movies for genre ${genre}`);

          // Thêm tag cache cho từng thể loại
          revalidateTag(`genre-${genre}`);
        } catch (error) {
          console.error(`[BATCH API] Error fetching genre ${genre}:`, error);
          if (result.genres)
            result.genres[genre] = {
              data: [],
              pagination: { totalItems: 0, totalItemsPerPage: 12, currentPage: 1, totalPages: 0 },
            };
        }
      });

      // Thêm tất cả genre promises vào mảng promises chính
      promises.push(...genrePromises);
    }

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Cache the result server-side
    console.log(`[BATCH API] Caching result for key: ${cacheKey}`);
    clientCache.set(cacheKey, result, CACHE_CONFIG.SERVER.BATCH * 1000); // Convert seconds to milliseconds

    // Thêm tags cho cache
    if (resources.includes('categories')) {
      revalidateTag('categories');
    }
    if (resources.includes('countries')) {
      revalidateTag('countries');
    }
    if (includePopularGenres) {
      revalidateTag('popular-genres');
    }

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set(
      'Cache-Control',
      `public, max-age=${CACHE_CONFIG.HTTP.BATCH}, s-maxage=${CACHE_CONFIG.SERVER.BATCH}, stale-while-revalidate=86400`
    );
    headers.set('X-Cache', 'MISS');

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error('Error in batch API:', error);
    return NextResponse.json({ error: 'Failed to fetch batch data' }, { status: 500 });
  }
}
