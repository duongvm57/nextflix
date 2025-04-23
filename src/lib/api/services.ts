/**
 * API Services - Tầng dịch vụ
 *
 * File này chịu trách nhiệm xử lý business logic và transformation data.
 * Sử dụng API Client để gọi API thực tế.
 */

import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/config/cache-config';
import { clientCache } from '@/lib/cache/client-cache';
import { logger } from '@/utils/logger';
import { Category, Country, Episode, Movie, MovieDetail, PaginatedResponse } from '@/types';
import * as apiClient from './client';
import { API_BASE_URL } from './constants';
import { ApiParams } from './client';

// Re-export constants for use in services
export { API_BASE_URL };
export const CACHED_ENDPOINTS = apiClient.CACHED_ENDPOINTS;

/**
 * Proxy API request
 */
export async function proxyAPIRequest(url: string, isStaticRoute: boolean = false): Promise<any> {
  try {
    logger.debug('[API Service] Proxying request to:', url);

    // Extract path from URL
    const path = url.replace(/^https?:\/\/phimapi\.com/i, '');
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const finalUrl = `${API_BASE_URL}${formattedPath}`;

    logger.debug('[API Service] Final URL:', finalUrl);

    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Use appropriate cache strategy based on route type
      cache: isStaticRoute ? 'force-cache' : 'no-store',
      next: isStaticRoute
        ? {
            revalidate: CACHE_CONFIG.SERVER.CATEGORIES,
            tags: ['categories', 'countries'],
          }
        : undefined,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('[API Service] Proxy error:', error);
    throw error;
  }
}

/**
 * Map API movie to Movie type
 */
function mapAPIMovieToMovie(apiMovie: any): Movie {
  return {
    _id: apiMovie._id || apiMovie.id || '',
    name: apiMovie.name || '',
    origin_name: apiMovie.origin_name || '',
    slug: apiMovie.slug || '',
    thumb_url: apiMovie.thumb_url || '',
    poster_url: apiMovie.poster_url || '',
    year: apiMovie.year || '',
    category: apiMovie.category || null,
    country: apiMovie.country || [],
    quality: apiMovie.quality || 'HD',
    view: apiMovie.view || 0,
    episode_current: apiMovie.episode_current || '',
    content: apiMovie.content || '',
    type: apiMovie.type || 'movie',
    time: apiMovie.time || '',
    lang: apiMovie.lang || '',
    genres: apiMovie.genres || [],
    actor: apiMovie.actor || [],
    director: apiMovie.director || [],
    duration: apiMovie.duration || '',
    status: apiMovie.status || 'completed',
  };
}

/**
 * Get empty response for pagination
 */
function getEmptyResponse(page: number): PaginatedResponse<Movie> {
  return {
    data: [],
    pagination: {
      totalItems: 0,
      totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
      currentPage: page,
      totalPages: 0,
    },
  };
}

/**
 * Fetch multiple pages for client-side pagination
 */
async function fetchMultiplePages<T>(
  fetchFn: (apiPage: number) => Promise<PaginatedResponse<T>>,
  clientPage: number
): Promise<PaginatedResponse<T>> {
  try {
    // Calculate API page based on client page and items per page
    const apiPage = Math.ceil(
      (clientPage * PAGINATION_CONFIG.ITEMS_PER_PAGE) / PAGINATION_CONFIG.ITEMS_PER_PAGE
    );

    // Fetch data for the calculated API page
    const response = await fetchFn(apiPage);

    return response;
  } catch (error) {
    logger.error('Error fetching multiple pages:', error);
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
        currentPage: clientPage,
        totalPages: 0,
      },
    };
  }
}

/**
 * Get categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    logger.debug('[API Service] getCategories called');

    // Check client cache first
    const cachedData = clientCache.get(CACHE_KEYS.CATEGORIES);
    if (cachedData) {
      logger.debug('[API Service] Using cached categories data');
      return cachedData as Category[];
    }

    logger.debug('[API Service] Fetching categories from API');

    const data = await apiClient.fetchCategories();
    const categories = Array.isArray(data)
      ? data.map((category: Category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }))
      : [];

    // Cache the result
    if (categories.length > 0) {
      clientCache.set(CACHE_KEYS.CATEGORIES, categories, CACHE_CONFIG.CLIENT.CATEGORIES);
    }

    return categories;
  } catch (error) {
    logger.error('[API Service] Error fetching categories:', error);
    return [];
  }
}

/**
 * Get countries
 */
export async function getCountries(): Promise<Country[]> {
  try {
    logger.debug('[API Service] getCountries called');

    // Check client cache first
    const cachedData = clientCache.get(CACHE_KEYS.COUNTRIES);
    if (cachedData) {
      logger.debug('[API Service] Using cached countries data');
      return cachedData as Country[];
    }

    logger.debug('[API Service] Fetching countries from API');

    const data = await apiClient.fetchCountries();
    const countries = Array.isArray(data)
      ? data.map((country: Country) => ({
          id: country.id,
          name: country.name,
          slug: country.slug,
        }))
      : [];

    // Cache the result
    if (countries.length > 0) {
      clientCache.set(CACHE_KEYS.COUNTRIES, countries, CACHE_CONFIG.CLIENT.COUNTRIES);
    }

    return countries;
  } catch (error) {
    logger.error('[API Service] Error fetching countries:', error);
    return [];
  }
}

/**
 * Get new movies
 */
export async function getNewMovies(
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  limit = PAGINATION_CONFIG.ITEMS_PER_PAGE,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching new movies for page: ${page}, limit: ${limit}`);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = options.sort_field === '_id' && options.sort_type === 'asc';
    console.log('[API Service] Checking for newest + ascending order in getNewMovies:', {
      sort_field: options.sort_field,
      sort_type: options.sort_type,
      isNewestAscending
    });
    const processedOptions = { ...options };

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order in getNewMovies');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedOptions.sort_type = 'desc';
    }

    // Chuyển đổi options thành dạng Record<string, string>
    const optionsRecord: Record<string, string> = {};
    Object.entries(processedOptions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        optionsRecord[key] = String(value);
      }
    });

    const response = await apiClient.fetchNewMovies(page, limit, optionsRecord);

    if (response && response.status === true) {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        logger.debug(`[API Service] Found ${response.items.length} movies`);
        logger.debug('[API Service] Pagination data:', response.pagination);

        let mappedData = response.items.map(mapAPIMovieToMovie);

        // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
        if (isNewestAscending && mappedData.length > 0) {
          console.log('[API Service] Reversing movie order for newest + ascending in getNewMovies');
          mappedData = [...mappedData].reverse();
        }

        return {
          data: mappedData,
          pagination: {
            totalItems: response.pagination?.totalItems || 0,
            totalItemsPerPage: response.pagination?.totalItemsPerPage || 20,
            currentPage: response.pagination?.currentPage || page,
            totalPages: response.pagination?.totalPages || 1,
          },
        };
      }
    }

    logger.debug('[API Service] No items found in API response');
    return getEmptyResponse(page);
  } catch (error) {
    logger.error('[API Service] Error fetching new movies:', error);
    return getEmptyResponse(page);
  }
}

/**
 * Get movies by category
 */
export async function getMoviesByCategory(
  slug: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for category: ${slug}, page: ${page}`);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = options.sort_field === '_id' && options.sort_type === 'asc';
    const processedOptions = { ...options };

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order in getMoviesByCategory');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedOptions.sort_type = 'desc';
    }

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
    };

    // Combine default options with provided options
    const params = {
      ...defaultOptions,
      ...processedOptions,
    };

    // Xử lý các danh mục đặc biệt
    const specialCategories = [
      'phim-le',
      'phim-bo',
      'hoat-hinh',
      'phim-vietsub',
      'phim-thuyet-minh',
      'phim-long-tieng',
      'tv-shows',
    ];

    let response;
    if (specialCategories.includes(slug)) {
      // Đối với các danh mục đặc biệt, sử dụng endpoint danh-sach
      logger.debug(`[API Service] Using movies list endpoint for special category: ${slug}`);

      // Tạo object params cho API call
      const apiParams: Record<string, string> = {
        page: page.toString(),
        limit: params.limit,
      };

      // Thêm các tham số tùy chọn nếu có
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'limit' && value !== undefined && value !== null && value !== '') {
          apiParams[key] = String(value);
        }
      });

      response = await apiClient.fetchAPIV1<any>(
        `${apiClient.API_ENDPOINTS.V1_MOVIES_LIST}/${slug}`,
        apiParams
      );
    } else {
      // Đối với các thể loại thông thường, sử dụng endpoint the-loai
      // Chuyển đổi params thành options cho fetchMoviesByCategory
      const categoryOptions: Record<string, string> = {};

      // Thêm các tham số tùy chọn nếu có
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'limit' && value !== undefined && value !== null && value !== '') {
          categoryOptions[key] = String(value);
        }
      });

      console.log(`[API Service] Category options for API call:`, categoryOptions);

      response = await apiClient.fetchMoviesByCategory(slug, page, parseInt(params.limit), categoryOptions);
    }

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for category ${slug}`);

        let mappedData = items.map(mapAPIMovieToMovie);

        // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
        if (isNewestAscending && mappedData.length > 0) {
          console.log('[API Service] Reversing movie order for newest + ascending in getMoviesByCategory');
          mappedData = [...mappedData].reverse();
        }

        return {
          data: mappedData,
          pagination: {
            totalItems: responseParams?.pagination?.totalItems || items.length,
            totalItemsPerPage:
              responseParams?.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams?.pagination?.currentPage || page,
            totalPages: responseParams?.pagination?.totalPages || 1,
          },
        };
      }
    }

    logger.debug(`[API Service] No items found for category ${slug}`);
    return getEmptyResponse(page);
  } catch (error) {
    logger.error(`[API Service] Error fetching movies for category ${slug}:`, error);
    return getEmptyResponse(page);
  }
}

/**
 * Get movies by country
 */
export async function getMoviesByCountry(
  slug: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for country ${slug}, page: ${page}`);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = options.sort_field === '_id' && options.sort_type === 'asc';
    const processedOptions = { ...options };

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order in getMoviesByCountry');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedOptions.sort_type = 'desc';
    }

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
    };

    // Combine default options with provided options
    const params = {
      ...defaultOptions,
      ...processedOptions,
    };

    // Chuyển đổi params thành options cho fetchMoviesByCountry
    const countryOptions: Record<string, string> = {};

    // Thêm các tham số tùy chọn nếu có
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'limit' && value !== undefined && value !== null && value !== '') {
        countryOptions[key] = String(value);
      }
    });

    const response = await apiClient.fetchMoviesByCountry(slug, page, parseInt(params.limit), countryOptions);

    // Kiểm tra cấu trúc response
    if (!response || typeof response !== 'object') {
      logger.warn(`[API Service] Invalid response for country ${slug}`);
      return getEmptyResponse(page);
    }

    // Kiểm tra xem response có phải là format V1 API không
    if (response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for country ${slug}`);

        let mappedData = items.map(mapAPIMovieToMovie);

        // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
        if (isNewestAscending && mappedData.length > 0) {
          console.log('[API Service] Reversing movie order for newest + ascending in getMoviesByCountry');
          mappedData = [...mappedData].reverse();
        }

        return {
          data: mappedData,
          pagination: {
            totalItems: responseParams?.pagination?.totalItems || items.length,
            totalItemsPerPage:
              responseParams?.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams?.pagination?.currentPage || page,
            totalPages: responseParams?.pagination?.totalPages || 1,
          },
        };
      }
    }

    // Kiểm tra xem response có phải là format cũ không
    if (response.data && Array.isArray(response.data)) {
      const processedItems = response.data;
      logger.debug(
        `[API Service] Found ${processedItems.length} movies for country ${slug} (old format)`
      );

      return {
        data: isNewestAscending && processedItems.length > 0
          ? [...processedItems.map(mapAPIMovieToMovie)].reverse()
          : processedItems.map(mapAPIMovieToMovie),
        pagination: response.pagination || {
          totalItems: response.data.length,
          totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
          currentPage: page,
          totalPages: Math.ceil(response.data.length / PAGINATION_CONFIG.ITEMS_PER_PAGE),
        },
      };
    }

    // Nếu không match với bất kỳ format nào
    logger.warn(`[API Service] Unexpected response format for country ${slug}:`, response);
    return getEmptyResponse(page);
  } catch (error) {
    logger.error(`[API Service] Error fetching movies for country ${slug}:`, error);
    return getEmptyResponse(page);
  }
}

/**
 * Get movies by year
 */
export async function getMoviesByYear(
  year: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for year ${year}, page: ${page}`);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = options.sort_field === '_id' && options.sort_type === 'asc';
    const processedOptions = { ...options };

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order in getMoviesByYear');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedOptions.sort_type = 'desc';
    }

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
      sort_field: 'modified.time',
      sort_type: 'desc',
    };

    // Filter out undefined values from options
    const filteredOptions: Record<string, string> = {};
    for (const [key, value] of Object.entries(processedOptions)) {
      if (value !== undefined && value !== null && value !== 'undefined') {
        filteredOptions[key] = value;
      }
    }

    // Chuyển đổi options thành dạng phù hợp cho API client
    const yearOptions: Record<string, string> = {};

    // Thêm các tham số tùy chọn nếu có
    Object.entries(filteredOptions).forEach(([key, value]) => {
      if (key !== 'limit' && value !== undefined && value !== null && value !== '') {
        yearOptions[key] = String(value);
      }
    });

    const response = await apiClient.fetchMoviesByYear(
      year,
      page,
      parseInt(filteredOptions.limit || defaultOptions.limit),
      yearOptions
    );

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for year ${year}`);

        let mappedData = items.map(mapAPIMovieToMovie);

        // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
        if (isNewestAscending && mappedData.length > 0) {
          console.log('[API Service] Reversing movie order for newest + ascending in getMoviesByYear');
          mappedData = [...mappedData].reverse();
        }

        return {
          data: mappedData,
          pagination: {
            totalItems: responseParams?.pagination?.totalItems || items.length,
            totalItemsPerPage:
              responseParams?.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams?.pagination?.currentPage || page,
            totalPages: responseParams?.pagination?.totalPages || 1,
          },
        };
      }
    }

    logger.debug(`[API Service] No items found for year ${year}`);
    return getEmptyResponse(page);
  } catch (error) {
    logger.error(`[API Service] Error fetching movies for year ${year}:`, error);
    return getEmptyResponse(page);
  }
}

/**
 * Search movies
 */
export async function searchMovies(
  keyword: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Searching movies for keyword: ${keyword}, page: ${page}`);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = options.sort_field === '_id' && options.sort_type === 'asc';
    const processedOptions = { ...options };

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order in searchMovies');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedOptions.sort_type = 'desc';
    }

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
      sort_field: 'modified.time',
      sort_type: 'desc',
    };

    // Filter out undefined values from options
    const filteredOptions: Record<string, string> = {};
    for (const [key, value] of Object.entries(processedOptions)) {
      if (value !== undefined && value !== null && value !== 'undefined') {
        filteredOptions[key] = value;
      }
    }

    // Chuyển đổi options thành dạng phù hợp cho API client
    const searchOptions: Record<string, string> = {};

    // Thêm các tham số tùy chọn nếu có
    Object.entries(filteredOptions).forEach(([key, value]) => {
      if (key !== 'limit' && value !== undefined && value !== null && value !== '') {
        searchOptions[key] = String(value);
      }
    });

    const response = await apiClient.fetchSearchMovies(
      keyword,
      page,
      parseInt(filteredOptions.limit || defaultOptions.limit),
      searchOptions
    );

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for keyword ${keyword}`);

        let mappedData = items.map(mapAPIMovieToMovie);

        // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
        if (isNewestAscending && mappedData.length > 0) {
          console.log('[API Service] Reversing movie order for newest + ascending in searchMovies');
          mappedData = [...mappedData].reverse();
        }

        return {
          data: mappedData,
          pagination: {
            totalItems: responseParams?.pagination?.totalItems || items.length,
            totalItemsPerPage:
              responseParams?.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams?.pagination?.currentPage || page,
            totalPages: responseParams?.pagination?.totalPages || 1,
          },
        };
      }
    }

    logger.debug(`[API Service] No items found for keyword ${keyword}`);
    return getEmptyResponse(page);
  } catch (error) {
    logger.error(`[API Service] Error searching movies for keyword ${keyword}:`, error);
    return getEmptyResponse(page);
  }
}

/**
 * Get movie detail
 */
export async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    logger.debug(`[API Service] Fetching movie detail for ${slug}`);

    const response = await apiClient.fetchMovieDetail(slug);

    if (!response || !response.movie) {
      logger.warn(`[API Service] No movie found for slug ${slug}`);
      return null;
    }

    const movie = response.movie;

    // Process episodes
    const episodes: any[] = [];

    if (response.episodes && Array.isArray(response.episodes)) {
      response.episodes.forEach((server: Episode) => {
        if (server && server.server_name && server.server_data) {
          const serverEpisodes = {
            server_name: server.server_name,
            server_data: server.server_data,
          };
          episodes.push(serverEpisodes);
        } else {
          logger.debug(`[API Service] Server ${server?.server_name} has no valid server_data`);
        }
      });
    } else {
      logger.debug('[API Service] No valid episodes array in API response');
    }

    logger.debug(`[API Service] Total episodes servers processed: ${episodes.length}`);

    return {
      ...movie,
      episodes,
    };
  } catch (error) {
    logger.error(`[API Service] Error fetching movie detail for ${slug}:`, error);
    return null;
  }
}

/**
 * Client-side paginated versions of API functions
 */
export async function getNewMoviesClientPaginated(
  clientPage = 1
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(apiPage => getNewMovies(apiPage), clientPage);
}

export async function getMoviesByCategoryClientPaginated(
  typeOrCategorySlug: string,
  clientPage = 1,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    apiPage => getMoviesByCategory(typeOrCategorySlug, apiPage, options),
    clientPage
  );
}

export async function getMoviesByCountryClientPaginated(
  countrySlug: string,
  clientPage = 1,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    apiPage => getMoviesByCountry(countrySlug, apiPage, options),
    clientPage
  );
}

export async function searchMoviesClientPaginated(
  keyword: string,
  clientPage = 1,
  options: Partial<ApiParams> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    return await fetchMultiplePages<Movie>(
      apiPage => searchMovies(keyword, apiPage, options),
      clientPage
    );
  } catch (error) {
    logger.error(`[API Service] Error searching movies for keyword ${keyword}:`, error);
    return getEmptyResponse(clientPage);
  }
}

/**
 * Hàm filter thông minh dựa trên route hiện tại
 *
 * @param routeType Loại route hiện tại (the-loai, quoc-gia, nam, tim-kiem)
 * @param routeSlug Slug của route hiện tại
 * @param filters Các tham số filter
 * @param page Trang hiện tại
 */
export async function getFilteredMovies(
  routeType: 'the-loai' | 'quoc-gia' | 'nam' | 'tim-kiem' | string,
  routeSlug: string,
  filters: Partial<ApiParams>,
  page = PAGINATION_CONFIG.DEFAULT_PAGE
): Promise<PaginatedResponse<Movie>> {
  // Sử dụng các tham số filter nguyên bản
  const processedFilters = { ...filters };
  try {
    logger.debug(`[API Service] Getting filtered movies for ${routeType}/${routeSlug} with filters:`, filters);
    console.log(`[API Service] Getting filtered movies for ${routeType}/${routeSlug} with filters:`, filters);

    // Xử lý đặc biệt cho trường hợp "Mới nhất" + "Tăng dần"
    const isNewestAscending = filters.sort_field === '_id' && filters.sort_type === 'asc';
    console.log('[API Service] Checking for newest + ascending order:', {
      sort_field: filters.sort_field,
      sort_type: filters.sort_type,
      isNewestAscending,
      originalFilters: {...filters},
      processedFilters: {...processedFilters}
    });

    if (isNewestAscending) {
      console.log('[API Service] Special handling for newest + ascending order');
      // Đổi thành "Mới nhất" + "Giảm dần" để lấy dữ liệu từ API
      processedFilters.sort_type = 'desc';
    }

    // Xác định xem có cần chuyển sang API tìm kiếm không
    let useSearchAPI = false;

    // Kiểm tra xem filter có chọn thể loại khác với route hiện tại không
    if (routeType === 'the-loai' && processedFilters.category && processedFilters.category !== routeSlug) {
      console.log('[API Service] Using search API because category filter differs from route slug');
      useSearchAPI = true;
    }

    // Kiểm tra xem filter có chọn quốc gia khác với route hiện tại không
    if (routeType === 'quoc-gia' && processedFilters.country && processedFilters.country !== routeSlug) {
      console.log('[API Service] Using search API because country filter differs from route slug');
      useSearchAPI = true;
    }

    // Kiểm tra xem filter có chọn năm khác với route hiện tại không
    if (routeType === 'nam' && processedFilters.year && processedFilters.year !== routeSlug) {
      console.log('[API Service] Using search API because year filter differs from route slug');
      useSearchAPI = true;
    }

    // Nếu có nhiều hơn một tham số filter chính, sử dụng API tìm kiếm
    const filterCount = Object.keys(processedFilters).filter(key =>
      processedFilters[key as keyof typeof processedFilters] &&
      key !== 'limit' &&
      key !== 'page' &&
      key !== 'sort_field' &&
      key !== 'sort_type' &&
      key !== 'sort_lang'
    ).length;

    if (filterCount > 1) {
      console.log(`[API Service] Using search API because multiple filters (${filterCount}) are applied`);
      useSearchAPI = true;
    }

    // Sử dụng API phù hợp dựa trên điều kiện
    let result: PaginatedResponse<Movie>;

    if (useSearchAPI) {
      // Sử dụng API tìm kiếm với các tham số filter
      logger.debug('[API Service] Using search API for filtering');
      console.log('[API Service] Using search API for filtering with params:', processedFilters);
      result = await searchMovies('', page, processedFilters);
    } else {
      // Sử dụng API tương ứng với route hiện tại
      switch (routeType) {
        case 'the-loai':
          logger.debug('[API Service] Using category API for filtering');
          console.log('[API Service] Using category API for filtering with slug:', routeSlug, 'and params:', processedFilters);
          result = await getMoviesByCategory(routeSlug, page, processedFilters);
          break;

        case 'quoc-gia':
          logger.debug('[API Service] Using country API for filtering');
          console.log('[API Service] Using country API for filtering with slug:', routeSlug, 'and params:', processedFilters);
          result = await getMoviesByCountry(routeSlug, page, processedFilters);
          break;

        case 'nam':
          logger.debug('[API Service] Using year API for filtering');
          console.log('[API Service] Using year API for filtering with slug:', routeSlug, 'and params:', processedFilters);
          result = await getMoviesByYear(routeSlug, page, processedFilters);
          break;

        case 'tim-kiem':
          logger.debug('[API Service] Using search API for filtering');
          console.log('[API Service] Using search API for filtering with keyword:', routeSlug, 'and params:', processedFilters);
          result = await searchMovies(routeSlug, page, processedFilters);
          break;

        default:
          // Mặc định sử dụng API danh sách phim mới
          logger.debug('[API Service] Using default new movies API for filtering');
          console.log('[API Service] Using default new movies API for filtering with params:', processedFilters);
          result = await getNewMovies(page, PAGINATION_CONFIG.ITEMS_PER_PAGE, processedFilters);
          break;
      }
    }

    console.log('[API Service] Filter result:', {
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      itemCount: result.data.length
    });

    // Nếu là "Mới nhất" + "Tăng dần", đảo ngược thứ tự phim
    if (isNewestAscending && result.data.length > 0) {
      console.log('[API Service] Reversing movie order for newest + ascending');
      result.data = [...result.data].reverse();

      // Đảm bảo rằng sort_type trong kết quả trả về vẫn là 'asc'
      console.log('[API Service] Original filters had sort_type =', filters.sort_type);
    }

    return result;
  } catch (error) {
    console.error(`[API Service] Error getting filtered movies:`, error);
    logger.error(`[API Service] Error getting filtered movies:`, error);
    return getEmptyResponse(page);
  }
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMoviesClientPaginated;
export const getTVShows = (page = 1) => getMoviesByCategoryClientPaginated('phim-bo', page);
export const getMoviesByGenre = getMoviesByCategoryClientPaginated;
export const getMovieBySlug = getMovieDetail;
