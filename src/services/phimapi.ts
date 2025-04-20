/* eslint-disable @typescript-eslint/no-explicit-any */
// API service for phimapi.com
import { Movie, MovieDetail, PaginatedResponse, Episode, Category, Country } from '@/types';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { logger } from '@/utils/logger';
import { clientCache } from '@/lib/cache/client-cache';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/config/cache-config';

// Import logApiCall if we're on the server
let logApiCall: (url: string, method: string, cache: string) => void;
if (typeof window === 'undefined') {
  // Only import on server-side
  import('../app/api/debug/route')
    .then(module => {
      logApiCall = module.logApiCall;
    })
    .catch(err => {
      console.error('Failed to import logApiCall:', err);
    });
}

// Helper function to generate empty response
function getEmptyResponse(
  page = 1,
  limit = PAGINATION_CONFIG.ITEMS_PER_PAGE
): PaginatedResponse<Movie> {
  return {
    data: [],
    pagination: {
      totalItems: 0,
      totalItemsPerPage: limit,
      currentPage: page,
      totalPages: 0,
    },
  };
}

// Helper function to fetch multiple pages and combine results
async function fetchMultiplePages<T>(
  fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
  clientPage: number,
  itemsPerClientPage: number = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Promise<PaginatedResponse<T>> {
  // Calculate which API pages we need to fetch
  // For example, if we want 20 items per client page:
  // Client page 1 -> API pages 1
  // Client page 2 -> API pages 2
  // And so on...
  // Since the API already returns 20 items per page, we can just use the client page directly
  const startApiPage = clientPage;

  logger.debug(
    `[DEBUG] fetchMultiplePages - clientPage: ${clientPage}, startApiPage: ${startApiPage}`
  );

  try {
    // Fetch two consecutive API pages
    logger.debug(
      `[DEBUG] fetchMultiplePages - Fetching API pages ${startApiPage} and ${startApiPage + 1}`
    );

    // Fetch pages one at a time for better error handling
    const page1Response = await fetchFunction(startApiPage);
    logger.debug(`[DEBUG] fetchMultiplePages - Page ${startApiPage} response:`, {
      totalItems: page1Response.pagination.totalItems,
      totalPages: page1Response.pagination.totalPages,
      itemCount: page1Response.data.length,
    });

    let page2Response;
    try {
      page2Response = await fetchFunction(startApiPage + 1);
      logger.debug(`[DEBUG] fetchMultiplePages - Page ${startApiPage + 1} response:`, {
        totalItems: page2Response.pagination.totalItems,
        totalPages: page2Response.pagination.totalPages,
        itemCount: page2Response.data.length,
      });
    } catch (error) {
      logger.error(`[DEBUG] fetchMultiplePages - Error fetching page ${startApiPage + 1}:`, error);
      // If second page fails, just use the first page
      page2Response = { data: [], pagination: page1Response.pagination };
    }

    // Combine the items from both pages
    const combinedItems = [...page1Response.data, ...page2Response.data];
    logger.debug(`[DEBUG] fetchMultiplePages - Combined ${combinedItems.length} items`);

    // First, let's fetch page 1 to get the accurate total pages from the API
    let firstPageResponse;
    try {
      // Only fetch page 1 if we're not already on page 1
      if (startApiPage !== 1) {
        firstPageResponse = await fetchFunction(1);
        logger.debug(`[DEBUG] fetchMultiplePages - First page response:`, {
          totalItems: firstPageResponse.pagination.totalItems,
          totalPages: firstPageResponse.pagination.totalPages,
          itemCount: firstPageResponse.data.length,
        });
      } else {
        // If we're already on page 1, use the page1Response
        firstPageResponse = page1Response;
      }
    } catch (error) {
      logger.error(`[DEBUG] fetchMultiplePages - Error fetching first page:`, error);
      // If first page fails, use the current page response
      firstPageResponse = page1Response;
    }

    // Get the total items and pages from the API response of page 1
    // This is the most reliable source for total pages
    const totalApiItems = firstPageResponse.pagination.totalItems;
    const apiTotalPages = firstPageResponse.pagination.totalPages;

    logger.debug(
      `[DEBUG] fetchMultiplePages - API reports ${totalApiItems} total items and ${apiTotalPages} total pages`
    );

    // Use the API's reported total pages directly
    // This is more reliable than calculating based on items per page
    let totalClientPages = apiTotalPages;

    // Adjust totalClientPages based on actual data availability
    if (combinedItems.length === 0 && clientPage > 1) {
      // If we're on a page beyond page 1 and there are no items, the previous page was the last one
      totalClientPages = clientPage - 1;
      logger.debug(
        `[DEBUG] fetchMultiplePages - Adjusting totalClientPages to ${totalClientPages} because current page ${clientPage} has no items`
      );
    } else if (combinedItems.length > 0) {
      // If we have items, make sure totalClientPages is at least the current page
      totalClientPages = Math.max(totalClientPages, clientPage);
      logger.debug(
        `[DEBUG] fetchMultiplePages - Ensuring totalClientPages is at least ${clientPage}`
      );
    }

    logger.debug(
      `[DEBUG] fetchMultiplePages - totalApiItems: ${totalApiItems}, totalClientPages: ${totalClientPages}`
    );

    // Return the paginated response with client-side pagination
    return {
      data: combinedItems,
      pagination: {
        totalItems: totalApiItems,
        totalItemsPerPage: itemsPerClientPage,
        currentPage: clientPage,
        totalPages: totalClientPages,
      },
    };
  } catch (error) {
    logger.error('[DEBUG] Error in fetchMultiplePages:', error);
    throw error;
  }
}

const API_BASE_URL = 'https://phimapi.com';
const API_V1_BASE_URL = 'https://phimapi.com/v1/api';

// Các endpoint API theo tài liệu
const API_ENDPOINTS = {
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

// Log API endpoints for debugging
logger.debug('API endpoints:', API_ENDPOINTS);
logger.debug('API V1 base URL:', API_V1_BASE_URL);

const CACHED_ENDPOINTS = [
  API_ENDPOINTS.CATEGORIES_LIST,
  API_ENDPOINTS.COUNTRIES_LIST,
  API_ENDPOINTS.V1_CATEGORY,
  API_ENDPOINTS.V1_COUNTRY,
];

// Hàm chung để gọi API
async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // Filter out undefined, null, or 'undefined' string values
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== 'undefined') {
      filteredParams[key] = value;
    }
  }

  const queryParams = new URLSearchParams(filteredParams).toString();

  // Make sure endpoint starts with a slash if needed
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Ensure API_BASE_URL doesn't end with a slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

  const originalUrl = `${baseUrl}${formattedEndpoint}${queryParams ? `?${queryParams}` : ''}`;

  // Use direct API call instead of proxy
  const proxyUrl = originalUrl;

  logger.debug(`[DEBUG] Fetching API: ${originalUrl}`);
  logger.debug(`[DEBUG] Using proxy: ${proxyUrl}`);

  // Log API call if we're on the server
  if (typeof window === 'undefined' && logApiCall) {
    logApiCall(originalUrl, 'GET', 'EXTERNAL');
  }

  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      // Use a longer timeout for API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
        // Use cache for better performance
        cache: CACHED_ENDPOINTS.some(e => endpoint.includes(e)) ? 'force-cache' : 'no-store',
        // Revalidate categories and countries every hour, otherwise disable cache
        next: CACHED_ENDPOINTS.some(e => endpoint.includes(e))
          ? { revalidate: 3600 } // Cache 1 giờ
          : { revalidate: 0 },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(`[DEBUG] API error: ${response.status}`);
        // For 503 errors, retry
        if (response.status === 503) {
          lastError = new Error(`API error: ${response.status}`);
          retries++;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      logger.debug(`[DEBUG] API response:`, data);
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error(`[DEBUG] Error fetching from ${originalUrl} (attempt ${retries + 1}):`, error);

      // If it's an AbortError (timeout) or a 503, retry
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        (error instanceof Error && error.message.includes('503'))
      ) {
        retries++;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        continue;
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error(`Failed after ${MAX_RETRIES} retries`);
}

// Hàm gọi API V1
async function fetchAPIV1<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  // Filter out undefined, null, or 'undefined' string values
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== 'undefined') {
      filteredParams[key] = value;
    }
  }

  const queryParams = new URLSearchParams(filteredParams).toString();

  // Make sure endpoint starts with a slash if needed
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Ensure API_V1_BASE_URL doesn't end with a slash
  const baseUrl = API_V1_BASE_URL.endsWith('/') ? API_V1_BASE_URL.slice(0, -1) : API_V1_BASE_URL;

  const url = `${baseUrl}${formattedEndpoint}${queryParams ? `?${queryParams}` : ''}`;

  // Add cache options for static pages
  const fetchOptions: RequestInit = {
    next: {
      revalidate: 3600, // Cache for 1 hour
    },
  };

  logger.debug(`[DEBUG] Fetching API V1: ${url}`);

  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Use a longer timeout for API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);

      logger.debug(`[DEBUG] API V1 response status: ${response.status}`);

      if (!response.ok) {
        logger.error(`[DEBUG] API V1 error: ${response.status}`);

        // For 503 errors, retry
        if (response.status === 503) {
          retries++;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }

        // For other errors, return a default response
        return {
          status: 'error',
          message: `API error: ${response.status}`,
          data: {
            items: [],
            params: {
              pagination: {
                totalItems: 0,
                totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
                currentPage: parseInt(params.page || '1'),
                totalPages: 0,
              },
            },
            APP_DOMAIN_CDN_IMAGE: '',
          },
        } as unknown as T;
      }

      const data = await response.json();
      logger.debug(`[DEBUG] API V1 response data:`, data);

      // Log detailed information about the response structure
      if (data) {
        logger.debug(`[DEBUG] API V1 response keys:`, Object.keys(data));
        if (data.data) {
          logger.debug(`[DEBUG] API V1 response data keys:`, Object.keys(data.data));
          if (data.data.items) {
            logger.debug(`[DEBUG] API V1 found ${data.data.items.length} items`);
            if (data.data.items.length > 0) {
              logger.debug(`[DEBUG] First item:`, data.data.items[0]);
            }
          }
        }
      }

      return data;
    } catch (error) {
      logger.error(`[DEBUG] Error fetching from ${url} (attempt ${retries + 1}):`, error);

      // If it's an AbortError (timeout) or a network error, retry
      if (
        (error instanceof Error && error.name === 'AbortError') ||
        (error instanceof Error && error.message.includes('network')) ||
        (error instanceof Error && error.message.includes('503'))
      ) {
        retries++;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        continue;
      }

      // For other errors, return a default response
      return {
        status: 'error',
        message: `Error fetching data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          items: [],
          params: {
            pagination: {
              totalItems: 0,
              totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
              currentPage: parseInt(params.page || '1'),
              totalPages: 0,
            },
          },
          APP_DOMAIN_CDN_IMAGE: '',
        },
      } as unknown as T;
    }
  }

  // If we've exhausted all retries, return a default response
  return {
    status: 'error',
    message: `Failed after ${MAX_RETRIES} retries`,
    data: {
      items: [],
      params: {
        pagination: {
          totalItems: 0,
          totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
          currentPage: parseInt(params.page || '1'),
          totalPages: 0,
        },
      },
      APP_DOMAIN_CDN_IMAGE: '',
    },
  } as unknown as T;
}

// Hàm chuyển đổi dữ liệu API sang định dạng Movie
function mapAPIMovieToMovie(apiMovie: any): Movie {
  // Thêm domain vào đường dẫn hình ảnh nếu cần
  const fixImageUrl = (url: string | undefined) => {
    if (!url) return 'https://placehold.co/300x450?text=Movie';
    if (url.startsWith('http')) return url;
    return `https://phimimg.com/${url}`;
  };

  // Use a stable ID for sample movies to avoid hydration errors
  const sampleId = apiMovie._id ? apiMovie._id : 'sample-movie';
  // Sử dụng năm hiện tại từ server để tránh lỗi hydration
  const currentYear = new Date().getFullYear();

  return {
    _id: sampleId,
    name: apiMovie.name || 'Unknown Movie',
    origin_name: apiMovie.origin_name || '',
    slug: apiMovie.slug || '',
    type: apiMovie.type || 'movie',
    thumb_url: fixImageUrl(apiMovie.thumb_url),
    poster_url: fixImageUrl(apiMovie.poster_url),
    year: apiMovie.year || currentYear,
    time: apiMovie.time || '',
    episode_current: apiMovie.episode_current || '',
    quality: apiMovie.quality || 'HD',
    lang: apiMovie.lang || '',
    view: apiMovie.view || 0,
    category:
      apiMovie.category && apiMovie.category.length > 0
        ? { name: apiMovie.category[0].name, slug: apiMovie.category[0].slug }
        : null,
    country:
      apiMovie.country && apiMovie.country.length > 0
        ? apiMovie.country.map((c: { name: string; slug: string }) => ({ name: c.name, slug: c.slug }))
        : [],
    genres:
      apiMovie.category && apiMovie.category.length > 0
        ? apiMovie.category.map((g: { name: string; slug: string }) => ({ name: g.name, slug: g.slug }))
        : [],
    status: 'ongoing',
    actors: apiMovie.actor || [],
    directors: apiMovie.director || [],
    duration: apiMovie.time || '',
    content: apiMovie.content || '',
  };
}

// Hàm chuyển đổi dữ liệu API sang định dạng MovieDetail
function mapAPIMovieToMovieDetail(apiMovie: any): MovieDetail {
  const movie = mapAPIMovieToMovie(apiMovie);

  // Chuyển đổi episodes từ API sang định dạng của ứng dụng
  const episodes: Episode[] = [];

  logger.debug('Processing episodes from API response');
  logger.debug('API episodes:', JSON.stringify(apiMovie.episodes, null, 2));

  if (apiMovie.episodes && Array.isArray(apiMovie.episodes) && apiMovie.episodes.length > 0) {
    apiMovie.episodes.forEach((server: any) => {
      logger.debug('Processing server:', server.server_name);
      if (
        server.server_data &&
        Array.isArray(server.server_data) &&
        server.server_data.length > 0
      ) {
        const serverEpisodes = {
          server_name: server.server_name,
          items: server.server_data.map((item: { name: string; slug: string; filename?: string; link_embed: string; link_m3u8: string }) => ({
            name: item.name,
            slug: item.slug,
            filename: item.filename || `${apiMovie.slug}-${item.slug}`,
            link_embed: item.link_embed,
            link_m3u8: item.link_m3u8,
          })),
        };
        logger.debug(
          `Added server ${server.server_name} with ${serverEpisodes.items.length} episodes`
        );
        episodes.push(serverEpisodes);
      } else {
        logger.debug(`Server ${server.server_name} has no valid server_data`);
      }
    });
  } else {
    logger.debug('No valid episodes array in API response');
  }

  logger.debug(`Total episodes servers processed: ${episodes.length}`);

  return {
    ...movie,
    episodes,
  };
}

// Get new movies
export async function getNewMovies(
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  limit = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`Fetching new movies for page: ${page}, limit: ${limit}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.NEW_MOVIES}`, {
      page: page.toString(),
      limit: limit.toString(),
    });
    logger.debug('API Response structure:', Object.keys(response));

    if (response && response.status === true) {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        logger.debug(`Found ${response.items.length} movies`);
        logger.debug('Pagination data:', response.pagination);

        return {
          data: response.items.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: response.pagination?.totalItems || 0,
            totalItemsPerPage: response.pagination?.totalItemsPerPage || 20,
            currentPage: response.pagination?.currentPage || page,
            totalPages: response.pagination?.totalPages || 1,
          },
        };
      } else {
        logger.debug('No items found in API response');
      }
    } else {
      logger.debug('API response status is not true');
    }

    logger.debug('API response not successful, returning empty response');
    return getEmptyResponse(page);
  } catch (error) {
    logger.error('Error fetching new movies:', error);
    // Return empty response in case of error
    return getEmptyResponse(page);
  }
}

// Get movie details by slug
export async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    logger.debug(`Fetching movie detail for slug: ${slug}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);
    logger.debug('API Response:', JSON.stringify(response, null, 2));

    if (response && response.status === true && response.movie) {
      // Create a new object with both movie data and episodes
      const movieWithEpisodes = {
        ...response.movie,
        episodes: response.episodes || [],
      };

      logger.debug('Movie with episodes:', JSON.stringify(movieWithEpisodes.episodes, null, 2));

      const movieDetail = mapAPIMovieToMovieDetail(movieWithEpisodes);
      logger.debug('Mapped movie detail:', JSON.stringify(movieDetail, null, 2));
      return movieDetail;
    }

    logger.error('Empty or invalid response from API');
    throw new Error('Empty or invalid response from API');
  } catch (error) {
    logger.error(`Error fetching movie with slug ${slug}:`, error);
    throw error; // Throw error instead of returning sample data
  }
}

// Get movies by type_list or category
export async function getMoviesByCategory(
  typeOrCategorySlug: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: Record<string, string> = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
    };

    // Filter out undefined values from options
    const filteredOptions: Record<string, string> = {};
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null && value !== 'undefined') {
        filteredOptions[key] = value;
      }
    }

    const params: Record<string, string> = {
      page: page.toString(),
      ...defaultOptions,
      ...filteredOptions,
    };

    // Determine if this is a category, country, or a type list
    let endpoint = '';
    const isLanguageType = ['phim-vietsub', 'phim-thuyet-minh', 'phim-long-tieng'].includes(
      typeOrCategorySlug
    );
    const isMovieType = ['phim-bo', 'phim-le', 'tv-shows', 'hoat-hinh'].includes(
      typeOrCategorySlug
    );
    const isYear = /^\d{4}$/.test(typeOrCategorySlug);

    logger.debug(`[DEBUG] getMoviesByCategory - typeOrCategorySlug: ${typeOrCategorySlug}`);
    logger.debug(`[DEBUG] getMoviesByCategory - options:`, options);

    // Check if this is a category slug
    const isCategorySlug =
      !isLanguageType && !isMovieType && !isYear && typeOrCategorySlug.includes('-');

    // Check if we're on the category page
    if (isCategorySlug) {
      // For categories, use the category endpoint directly
      endpoint = `${API_ENDPOINTS.V1_CATEGORY}/${typeOrCategorySlug}`;
      logger.debug(`[DEBUG] Using category endpoint for slug: ${typeOrCategorySlug}`);
    } else if (isYear) {
      // For years, use the movies list endpoint with year parameter
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      params.year = typeOrCategorySlug;
      logger.debug(`[DEBUG] Using year parameter: ${typeOrCategorySlug}`);
    } else if (isLanguageType || isMovieType) {
      // For all type lists (movie types and language types), use the danh-sach endpoint
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/${typeOrCategorySlug}`;
      logger.debug(`[DEBUG] Using type list: ${typeOrCategorySlug}`);

      // Add additional filters if provided
      if (options.category) {
        logger.debug(`[DEBUG] Adding category filter: ${options.category}`);
      }

      if (options.country) {
        logger.debug(`[DEBUG] Adding country filter: ${options.country}`);
      }

      if (options.year) {
        logger.debug(`[DEBUG] Adding year filter: ${options.year}`);
      }
    } else {
      // Default to phim-bo if we can't determine the type
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      logger.debug(`[DEBUG] Using default type list: phim-bo`);
    }

    logger.debug(
      `[DEBUG] Fetching from endpoint: ${endpoint} with params:`,
      JSON.stringify(params, null, 2)
    );
    const response = await fetchAPIV1<any>(endpoint, params);
    logger.debug(`[DEBUG] Response status:`, response.status);
    logger.debug(`[DEBUG] Response data structure:`, Object.keys(response.data || {}));
    if (response.data && response.data.items) {
      logger.debug(`[DEBUG] Found ${response.data.items.length} items`);
      if (response.data.items.length > 0) {
        logger.debug(
          `[DEBUG] First item:`,
          JSON.stringify(response.data.items[0], null, 2).substring(0, 200) + '...'
        );
      }
    } else {
      logger.debug(`[DEBUG] No items found in response:`, response);
    }

    // Process the response
    if (response && response.data) {
      // Use optional chaining and default values to handle missing properties
      const {
        items = [],
        params: responseParams = { pagination: {} },
        APP_DOMAIN_CDN_IMAGE = '',
      } = response.data;

      // Log first item to check structure
      if (items && items.length > 0) {
        logger.debug(`Found ${items.length} movies for ${typeOrCategorySlug}`);
        logger.debug('First item:', JSON.stringify(items[0], null, 2));
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map((item: { thumb_url: string; poster_url: string }) => {
          if (item.thumb_url && !item.thumb_url.startsWith('http')) {
            item.thumb_url = `${APP_DOMAIN_CDN_IMAGE}/${item.thumb_url}`;
          }
          if (item.poster_url && !item.poster_url.startsWith('http')) {
            item.poster_url = `${APP_DOMAIN_CDN_IMAGE}/${item.poster_url}`;
          }
          return item;
        });

        return {
          data: processedItems.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: responseParams.pagination?.totalItems || 0,
            totalItemsPerPage:
              responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams.pagination?.currentPage || page,
            totalPages: responseParams.pagination?.totalPages || 1,
          },
        };
      }
    }

    // If we get here, either the response was invalid or there were no items
    logger.debug(`No valid data found for ${typeOrCategorySlug}, returning empty response`);
    return getEmptyResponse(page);
  } catch (error) {
    logger.error(`Error fetching movies for ${typeOrCategorySlug}:`, error);
    // Return empty response in case of error
    return getEmptyResponse(page);
  }
}

// Get movies by country
export async function getMoviesByCountry(slug: string, page = 1, options: { limit?: string } = {}) {
  try {
    const response = await fetchAPIV1<any>(`${API_ENDPOINTS.V1_COUNTRY}/${slug}`, {
      page: page.toString(),
      ...options,
    });

    // Kiểm tra cấu trúc response
    if (!response || typeof response !== 'object') {
      console.warn(`Invalid response for country ${slug}`);
      return getEmptyResponse(page);
    }

    // Kiểm tra nếu response là dạng { data: { items: [] } }
    if (response.data && Array.isArray(response.data.items)) {
      // Xử lý URL ảnh với APP_DOMAIN_CDN_IMAGE
      const { items, params, APP_DOMAIN_CDN_IMAGE } = response.data;

      // Xử lý URL ảnh cho từng item
      const processedItems = items.map((item: { thumb_url: string; poster_url: string }) => {
        if (item.thumb_url && !item.thumb_url.startsWith('http')) {
          item.thumb_url = `${APP_DOMAIN_CDN_IMAGE}/${item.thumb_url}`;
        }
        if (item.poster_url && !item.poster_url.startsWith('http')) {
          item.poster_url = `${APP_DOMAIN_CDN_IMAGE}/${item.poster_url}`;
        }
        return item;
      });

      return {
        data: processedItems.map(mapAPIMovieToMovie),
        pagination: params?.pagination || {
          totalItems: items.length,
          totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
          currentPage: page,
          totalPages: Math.ceil(items.length / PAGINATION_CONFIG.ITEMS_PER_PAGE),
        },
      };
    }

    // Kiểm tra nếu response.data là array trực tiếp
    if (Array.isArray(response.data)) {
      const { APP_DOMAIN_CDN_IMAGE } = response;

      // Xử lý URL ảnh cho từng item
      const processedItems = response.data.map(
        (item: { thumb_url: string; poster_url: string }) => {
          if (item.thumb_url && !item.thumb_url.startsWith('http')) {
            item.thumb_url = `${APP_DOMAIN_CDN_IMAGE}/${item.thumb_url}`;
          }
          if (item.poster_url && !item.poster_url.startsWith('http')) {
            item.poster_url = `${APP_DOMAIN_CDN_IMAGE}/${item.poster_url}`;
          }
          return item;
        }
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
    console.warn(`Unexpected response format for country ${slug}:`, response);
    return getEmptyResponse(page);
  } catch (error) {
    console.error(`Error fetching movies for country ${slug}:`, error);
    return getEmptyResponse(page);
  }
}

// Get movies by year
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

    const params: Record<string, string> = {
      page: page.toString(),
      ...defaultOptions,
      ...filteredOptions,
      year: year, // Add year as a parameter instead of part of the URL
    };

    // Use the movies list API endpoint with year as a parameter
    const url = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`; // Use phim-bo as the base type
    logger.debug(`Fetching movies for year ${year}, URL: ${url}, params:`, params);

    try {
      const response = await fetchAPIV1<any>(url, params);
      logger.debug(`API response for year ${year}:`, response);

      if (response && response.status === 'success' && response.data) {
        const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

        if (items && items.length > 0) {
          logger.debug(`Found ${items.length} movies for year ${year}`);
          logger.debug('Pagination data:', responseParams.pagination);
          logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

          // Add image domain to each item
          const processedItems = items.map((item: { thumb_url: string; poster_url: string }) => {
            if (item.thumb_url && !item.thumb_url.startsWith('http')) {
              item.thumb_url = `${APP_DOMAIN_CDN_IMAGE}/${item.thumb_url}`;
            }
            if (item.poster_url && !item.poster_url.startsWith('http')) {
              item.poster_url = `${APP_DOMAIN_CDN_IMAGE}/${item.poster_url}`;
            }
            return item;
          });

          return {
            data: processedItems.map(mapAPIMovieToMovie),
            pagination: {
              totalItems: responseParams.pagination?.totalItems || 0,
              totalItemsPerPage:
                responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
              currentPage: responseParams.pagination?.currentPage || page,
              totalPages: responseParams.pagination?.totalPages || 1,
            },
          };
        }
      }

      // If we get here, the response didn't have the expected structure
      logger.error(`Invalid response structure for year ${year}:`, response);
      throw new Error('Invalid API response structure');
    } catch (error) {
      logger.error(`Error in fetchAPIV1 for year ${year}:`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Error fetching movies for year ${year}:`, error);
    // Return empty response in case of error
    return getEmptyResponse(page);
  }
}

// Search movies
/**
 * Search for movies using the API
 *
 * @param keyword - Search keyword
 * @param page - Page number (default: 1)
 * @param options - Additional options
 * @param options.sort_field - Sort field (modified.time, _id, year)
 * @param options.sort_type - Sort type (desc, asc)
 * @param options.sort_lang - Language filter (vietsub, thuyet-minh, long-tieng)
 * @param options.category - Category slug
 * @param options.country - Country slug
 * @param options.year - Release year (1970-present)
 * @param options.limit - Results limit (max 64)
 * @returns Promise with paginated movie results
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

    const params: Record<string, string> = {
      keyword,
      page: page.toString(),
      ...defaultOptions,
      ...filteredOptions,
    };

    logger.debug(`Searching for movies with keyword: ${keyword}, params:`, params);
    const response = await fetchAPIV1<any>(`${API_ENDPOINTS.V1_SEARCH}`, params);

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

      if (items && items.length > 0) {
        logger.debug(`Found ${items.length} movies for search keyword ${keyword}`);
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map((item: { thumb_url: string; poster_url: string }) => {
          if (item.thumb_url && !item.thumb_url.startsWith('http')) {
            item.thumb_url = `${APP_DOMAIN_CDN_IMAGE}/${item.thumb_url}`;
          }
          if (item.poster_url && !item.poster_url.startsWith('http')) {
            item.poster_url = `${APP_DOMAIN_CDN_IMAGE}/${item.poster_url}`;
          }
          return item;
        });

        return {
          data: processedItems.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: responseParams.pagination?.totalItems || 0,
            totalItemsPerPage:
              responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams.pagination?.currentPage || page,
            totalPages: responseParams.pagination?.totalPages || 1,
          },
        };
      }
    }

    // Return empty results for search
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
        currentPage: page,
        totalPages: 0,
      },
    };
  } catch (error) {
    logger.error(`Error searching for movies with keyword ${keyword}:`, error);
    // Return empty results for search
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
}

// Get categories
export async function getCategories(): Promise<Category[]> {
  try {
    console.log('[API] getCategories called');
    // Check client cache first
    const cachedData = clientCache.get(CACHE_KEYS.CATEGORIES);
    if (cachedData) {
      console.log('[API] Using cached categories data');

      // Log API call with cache hit if we're on the server
      if (typeof window === 'undefined' && logApiCall) {
        logApiCall(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`, 'GET', 'HIT');
      }

      return cachedData as Category[];
    }

    console.log('[API] Fetching categories from API');

    // Log API call with cache miss if we're on the server
    if (typeof window === 'undefined' && logApiCall) {
      logApiCall(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`, 'GET', 'MISS');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`, {
      next: {
        revalidate: CACHE_CONFIG.SERVER.CATEGORIES,
        tags: ['categories'],
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();
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
    console.error('[API] Error fetching categories:', error);
    return [];
  }
}

// Get countries
export async function getCountries(): Promise<Country[]> {
  try {
    console.log('[API] getCountries called');
    // Check client cache first
    const cachedData = clientCache.get(CACHE_KEYS.COUNTRIES);
    if (cachedData) {
      console.log('[API] Using cached countries data');

      // Log API call with cache hit if we're on the server
      if (typeof window === 'undefined' && logApiCall) {
        logApiCall(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`, 'GET', 'HIT');
      }

      return cachedData as Country[];
    }

    console.log('[API] Fetching countries from API');

    // Log API call with cache miss if we're on the server
    if (typeof window === 'undefined' && logApiCall) {
      logApiCall(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`, 'GET', 'MISS');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`, {
      next: {
        revalidate: CACHE_CONFIG.SERVER.COUNTRIES,
        tags: ['countries'],
      },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data = await response.json();
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
    console.error('[API] Error fetching countries:', error);
    return [];
  }
}

// Client-side paginated versions of API functions
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

// Use mock data for testing

export async function searchMoviesClientPaginated(
  keyword: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    // Use real API data
    return await fetchMultiplePages<Movie>(
      apiPage => searchMovies(keyword, apiPage, options),
      clientPage
    );
  } catch (error) {
    logger.error(`Error searching movies for keyword ${keyword}:`, error);
    // Return empty response in case of error
    return getEmptyResponse(clientPage);
  }
}

export async function getMoviesByYearClientPaginated(
  year: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  logger.debug(
    `[DEBUG] getMoviesByYearClientPaginated called with year: ${year}, clientPage: ${clientPage}, options:`,
    options
  );

  try {
    const result = await fetchMultiplePages<Movie>(
      apiPage => getMoviesByYear(year, apiPage, options),
      clientPage
    );

    logger.debug(`[DEBUG] getMoviesByYearClientPaginated result for year ${year}:`, {
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      movieCount: result.data.length,
    });

    return result;
  } catch (error) {
    logger.error(`[DEBUG] Error in getMoviesByYearClientPaginated for year ${year}:`, error);
    throw error;
  }
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMoviesClientPaginated;
export const getTVShows = (page = 1) => getMoviesByCategoryClientPaginated('phim-bo', page);
export const getMoviesByGenre = getMoviesByCategoryClientPaginated;
export const getMovieBySlug = getMovieDetail;
