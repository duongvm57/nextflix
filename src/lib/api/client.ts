/**
 * API Client - Tầng gọi API thực tế
 *
 * File này chịu trách nhiệm duy nhất cho việc gọi API thực tế.
 * Tất cả các hàm gọi API thực tế đều nên được tập trung vào file này.
 */

import { logger } from '@/utils/logger';
import { API_BASE_URL, API_V1_BASE_URL } from './constants';

/**
 * Interface cho các tham số API chung
 */
export interface ApiParams {
  type?: string;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
  category?: string;
  country?: string;
  year?: string;
  limit?: string;
  page?: string;
}

/**
 * Interface cho các tham số API tìm kiếm
 */
export interface SearchApiParams extends ApiParams {
  keyword: string;
}

// Các endpoint API theo tài liệu
export const API_ENDPOINTS = {
  // Danh sách phim
  NEW_MOVIES: '/danh-sach/phim-moi-cap-nhat-v3',

  // Thông tin phim
  MOVIE_DETAIL: '/phim',

  // API V1 endpoints
  V1_MOVIES_LIST: '/danh-sach',
  V1_SEARCH: '/tim-kiem',
  V1_CATEGORY: '/the-loai',
  V1_COUNTRY: '/quoc-gia',
  V1_YEAR: '/nam',

  // Category and country list endpoints
  CATEGORIES_LIST: '/the-loai',
  COUNTRIES_LIST: '/quoc-gia',
};

// Các endpoint cần cache
export const CACHED_ENDPOINTS = [
  'the-loai',
  'quoc-gia',
  'danh-muc',
  'phim-le',
  'phim-bo',
  'phim-chieu-rap',
  'phim-sap-chieu',
];

/**
 * Fetch API với retry logic và error handling
 */
export async function fetchAPI<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  logger.debug(`[API Client] Fetching from ${endpoint} with params:`, params);

  // Tạo query string từ params
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== 'undefined') {
      queryParams.append(key, value);
    }
  }

  // Tạo URL đầy đủ
  const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  console.log(`[API Client] Full URL: ${url}`);

  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      // Use a longer timeout for API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
        // Use cache for better performance
        cache: CACHED_ENDPOINTS.some(e => endpoint.includes(e)) ? 'force-cache' : 'no-store',
        // Revalidate categories and countries every hour, otherwise disable cache
        next: CACHED_ENDPOINTS.some(e => endpoint.includes(e))
          ? { revalidate: 3600 } // Cache 1 giờ
          : { revalidate: 0 },
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;
      retries++;
      logger.error(`[API Client] Error fetching ${url}, retry ${retries}/${MAX_RETRIES}:`, error);

      // Wait before retrying (exponential backoff)
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}

/**
 * Fetch API V1 với retry logic và error handling
 */
export async function fetchAPIV1<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  logger.debug(`[API Client] Fetching V1 API from ${endpoint} with params:`, params);

  // Tạo query string từ params
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== 'undefined') {
      queryParams.append(key, value);
    }
  }

  // Tạo URL đầy đủ
  const url = `${API_V1_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  console.log(`[API Client] Full V1 URL: ${url}`);

  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      // Use a longer timeout for API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal,
        // Use cache for better performance
        cache: CACHED_ENDPOINTS.some(e => endpoint.includes(e)) ? 'force-cache' : 'no-store',
        // Revalidate categories and countries every hour, otherwise disable cache
        next: CACHED_ENDPOINTS.some(e => endpoint.includes(e))
          ? { revalidate: 3600 } // Cache 1 giờ
          : { revalidate: 0 },
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;
      retries++;
      logger.error(`[API Client] Error fetching ${url}, retry ${retries}/${MAX_RETRIES}:`, error);

      // Wait before retrying (exponential backoff)
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries`);
}

/**
 * Fetch danh sách thể loại
 */
export async function fetchCategories() {
  logger.debug('[API Client] Fetching categories');
  return fetchAPI<any>(`${API_ENDPOINTS.CATEGORIES_LIST}`);
}

/**
 * Fetch danh sách quốc gia
 */
export async function fetchCountries() {
  logger.debug('[API Client] Fetching countries');
  return fetchAPI<any>(`${API_ENDPOINTS.COUNTRIES_LIST}`);
}

/**
 * Fetch danh sách phim mới
 */
export async function fetchNewMovies(
  page: number = 1,
  limit: number = 15,
  options: Partial<ApiParams> = {}
) {
  logger.debug(`[API Client] Fetching new movies for page ${page}`);

  // Tạo object params với các giá trị mặc định
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  // Thêm các tham số tùy chọn nếu có
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });

  console.log(`[API Client] Fetching new movies with params:`, params);
  console.log(`[API Client] Original options:`, options);

  return fetchAPI<any>(`${API_ENDPOINTS.NEW_MOVIES}`, params);
}

/**
 * Fetch thông tin phim theo slug
 */
export async function fetchMovieDetail(slug: string) {
  logger.debug(`[API Client] Fetching movie detail for ${slug}`);
  return fetchAPI<any>(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);
}

/**
 * Fetch danh sách phim theo thể loại
 */
export async function fetchMoviesByCategory(
  slug: string,
  page: number = 1,
  limit: number = 15,
  options: Partial<ApiParams> = {}
) {
  logger.debug(`[API Client] Fetching movies by category ${slug} for page ${page}`);

  // Tạo object params với các giá trị mặc định
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  // Thêm các tham số tùy chọn nếu có
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });

  console.log(`[API Client] Fetching movies by category with params:`, params);
  console.log(`[API Client] Original options:`, options);

  return fetchAPIV1<any>(`${API_ENDPOINTS.V1_CATEGORY}/${slug}`, params);
}

/**
 * Fetch danh sách phim theo quốc gia
 */
export async function fetchMoviesByCountry(
  slug: string,
  page: number = 1,
  limit: number = 15,
  options: Partial<ApiParams> = {}
) {
  logger.debug(`[API Client] Fetching movies by country ${slug} for page ${page}`);

  // Tạo object params với các giá trị mặc định
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  // Thêm các tham số tùy chọn nếu có
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });

  console.log(`[API Client] Fetching movies by country with params:`, params);
  console.log(`[API Client] Original options:`, options);

  return fetchAPIV1<any>(`${API_ENDPOINTS.V1_COUNTRY}/${slug}`, params);
}

/**
 * Fetch danh sách phim theo năm
 */
export async function fetchMoviesByYear(
  year: string,
  page: number = 1,
  limit: number = 15,
  options: Partial<ApiParams> = {}
) {
  logger.debug(`[API Client] Fetching movies by year ${year} for page ${page}`);

  // Tạo object params với các giá trị mặc định
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
    year,
  };

  // Xác định endpoint dựa trên type (nếu có)
  const endpoint = options.type ?
    `${API_ENDPOINTS.V1_MOVIES_LIST}/${options.type}` :
    `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;

  // Thêm các tham số tùy chọn nếu có
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });

  console.log(`[API Client] Fetching movies by year with params:`, params);
  console.log(`[API Client] Original options:`, options);

  return fetchAPIV1<any>(endpoint, params);
}

/**
 * Tìm kiếm phim
 */
export async function fetchSearchMovies(
  keyword: string,
  page: number = 1,
  limit: number = 15,
  options: Partial<ApiParams> = {}
) {
  logger.debug(`[API Client] Searching movies for ${keyword} on page ${page}`);

  // Tạo object params với các giá trị mặc định
  const params: Record<string, string> = {
    keyword,
    page: page.toString(),
    limit: limit.toString(),
  };

  // Thêm các tham số tùy chọn nếu có
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = String(value);
    }
  });

  console.log(`[API Client] Searching movies with params:`, params);
  console.log(`[API Client] Original options:`, options);

  return fetchAPIV1<any>(`${API_ENDPOINTS.V1_SEARCH}`, params);
}
