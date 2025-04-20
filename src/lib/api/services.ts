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
  limit = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching new movies for page: ${page}, limit: ${limit}`);

    const response = await apiClient.fetchNewMovies(page, limit);

    if (response && response.status === true) {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        logger.debug(`[API Service] Found ${response.items.length} movies`);
        logger.debug('[API Service] Pagination data:', response.pagination);

        return {
          data: response.items.map(mapAPIMovieToMovie),
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
  options: Record<string, string> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for category: ${slug}, page: ${page}`);

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
    };

    // Combine default options with provided options
    const params = {
      ...defaultOptions,
      ...options,
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
      response = await apiClient.fetchAPIV1<any>(
        `${apiClient.API_ENDPOINTS.V1_MOVIES_LIST}/${slug}`,
        {
          page: page.toString(),
          limit: params.limit,
        }
      );
    } else {
      // Đối với các thể loại thông thường, sử dụng endpoint the-loai
      response = await apiClient.fetchMoviesByCategory(slug, page, parseInt(params.limit));
    }

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for category ${slug}`);

        return {
          data: items.map(mapAPIMovieToMovie),
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
  options: { limit?: string } = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for country ${slug}, page: ${page}`);

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
    };

    // Combine default options with provided options
    const params = {
      ...defaultOptions,
      ...options,
    };

    const response = await apiClient.fetchMoviesByCountry(slug, page, parseInt(params.limit));

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

        return {
          data: items.map(mapAPIMovieToMovie),
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
        data: processedItems.map(mapAPIMovieToMovie),
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
  options: {
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    country?: string;
    limit?: string;
  } = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Fetching movies for year ${year}, page: ${page}`);

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
      sort_field: 'modified.time',
      sort_type: 'desc',
    };

    // Filter out undefined values from options
    const filteredOptions: Record<string, string> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null && value !== 'undefined') {
        filteredOptions[key] = value;
      }
    }

    const response = await apiClient.fetchMoviesByYear(
      year,
      page,
      parseInt(filteredOptions.limit || defaultOptions.limit)
    );

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for year ${year}`);

        return {
          data: items.map(mapAPIMovieToMovie),
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
  options: {
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    country?: string;
    year?: string;
    limit?: string;
  } = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`[API Service] Searching movies for keyword: ${keyword}, page: ${page}`);

    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
      sort_field: 'modified.time',
      sort_type: 'desc',
    };

    // Filter out undefined values from options
    const filteredOptions: Record<string, string> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null && value !== 'undefined') {
        filteredOptions[key] = value;
      }
    }

    const response = await apiClient.fetchSearchMovies(
      keyword,
      page,
      parseInt(filteredOptions.limit || defaultOptions.limit)
    );

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams } = response.data;

      if (items && Array.isArray(items)) {
        logger.debug(`[API Service] Found ${items.length} movies for keyword ${keyword}`);

        return {
          data: items.map(mapAPIMovieToMovie),
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
  options = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    apiPage => getMoviesByCategory(typeOrCategorySlug, apiPage, options),
    clientPage
  );
}

export async function getMoviesByCountryClientPaginated(
  countrySlug: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    apiPage => getMoviesByCountry(countrySlug, apiPage, options),
    clientPage
  );
}

export async function searchMoviesClientPaginated(
  keyword: string,
  clientPage = 1,
  options = {}
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

// Alias functions for compatibility with existing code
export const getMovies = getNewMoviesClientPaginated;
export const getTVShows = (page = 1) => getMoviesByCategoryClientPaginated('phim-bo', page);
export const getMoviesByGenre = getMoviesByCategoryClientPaginated;
export const getMovieBySlug = getMovieDetail;
