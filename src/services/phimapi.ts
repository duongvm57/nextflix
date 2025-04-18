// API service for phimapi.com
import { Movie, MovieDetail, PaginatedResponse, Episode } from '@/types';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { logger } from '@/utils/logger';

// Helper function to fetch multiple pages and combine results
async function fetchMultiplePages<T>(
  fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
  clientPage: number,
  itemsPerClientPage: number = PAGINATION_CONFIG.ITEMS_PER_PAGE
): Promise<PaginatedResponse<T>> {
  // Calculate which API pages we need to fetch
  // For example, if we want 20 items per client page:
  // Client page 1 -> API pages 1 and 2
  // Client page 2 -> API pages 3 and 4
  // And so on...
  const startApiPage = (clientPage - 1) * 2 + 1;

  logger.debug(`[DEBUG] fetchMultiplePages - clientPage: ${clientPage}, startApiPage: ${startApiPage}`);
  logger.debug(`[DEBUG] fetchMultiplePages - clientPage: ${clientPage}, startApiPage: ${startApiPage}`);

  try {
    // Fetch two consecutive API pages
    logger.debug(`[DEBUG] fetchMultiplePages - Fetching API pages ${startApiPage} and ${startApiPage + 1}`);

    // Fetch pages one at a time for better error handling
    const page1Response = await fetchFunction(startApiPage);
    logger.debug(`[DEBUG] fetchMultiplePages - Page ${startApiPage} response:`, {
      totalItems: page1Response.pagination.totalItems,
      totalPages: page1Response.pagination.totalPages,
      itemCount: page1Response.data.length
    });

    let page2Response;
    try {
      page2Response = await fetchFunction(startApiPage + 1);
      logger.debug(`[DEBUG] fetchMultiplePages - Page ${startApiPage + 1} response:`, {
        totalItems: page2Response.pagination.totalItems,
        totalPages: page2Response.pagination.totalPages,
        itemCount: page2Response.data.length
      });
    } catch (error) {
      logger.error(`[DEBUG] fetchMultiplePages - Error fetching page ${startApiPage + 1}:`, error);
      logger.error(`[DEBUG] fetchMultiplePages - Error fetching page ${startApiPage + 1}:`, error);
      // If second page fails, just use the first page
      page2Response = { data: [], pagination: page1Response.pagination };
    }

    // Combine the items from both pages
    const combinedItems = [...page1Response.data, ...page2Response.data];
    logger.debug(`[DEBUG] fetchMultiplePages - Combined ${combinedItems.length} items`);
    logger.debug(`[DEBUG] fetchMultiplePages - Combined ${combinedItems.length} items`);

    // Calculate total client pages based on total items and items per client page
    const totalApiItems = page1Response.pagination.totalItems;
    const totalClientPages = Math.ceil(totalApiItems / itemsPerClientPage);

    logger.debug(`[DEBUG] fetchMultiplePages - totalApiItems: ${totalApiItems}, totalClientPages: ${totalClientPages}`);
    logger.debug(`[DEBUG] fetchMultiplePages - totalApiItems: ${totalApiItems}, totalClientPages: ${totalClientPages}`);

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
logger.debug('API endpoints:', API_ENDPOINTS);
logger.debug('API V1 base URL:', API_V1_BASE_URL);

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
  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const originalUrl = `${baseUrl}${formattedEndpoint}${queryParams ? `?${queryParams}` : ''}`;

  // Use direct API call instead of proxy
  const proxyUrl = originalUrl;

  logger.debug(`[DEBUG] Fetching API: ${originalUrl}`);
  logger.debug(`[DEBUG] Using proxy: ${proxyUrl}`);

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Disable caching to ensure fresh data
      next: { revalidate: 0 } // Disable Next.js cache
    });

    if (!response.ok) {
      logger.error(`[DEBUG] API error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    logger.debug(`[DEBUG] API response:`, data);
    logger.debug(`[DEBUG] API response:`, data);
    return data;
  } catch (error) {
    logger.error(`[DEBUG] Error fetching from ${originalUrl}:`, error);
    throw error;
  }
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
  const baseUrl = API_V1_BASE_URL.endsWith('/')
    ? API_V1_BASE_URL.slice(0, -1)
    : API_V1_BASE_URL;

  const originalUrl = `${baseUrl}${formattedEndpoint}${queryParams ? `?${queryParams}` : ''}`;

  // Use direct API call instead of proxy
  const proxyUrl = originalUrl;

  logger.debug(`[DEBUG] Fetching API V1: ${originalUrl}`);
  logger.debug(`[DEBUG] Using proxy: ${proxyUrl}`);

  try {
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // Disable caching to ensure fresh data
      next: { revalidate: 0 } // Disable Next.js cache
    });

    logger.debug(`[DEBUG] API V1 response status: ${response.status}`);
    logger.debug(`[DEBUG] API V1 response status: ${response.status}`);

    if (!response.ok) {
      logger.error(`[DEBUG] API V1 error: ${response.status}`);
      logger.error(`[DEBUG] API V1 error: ${response.status}`);
      // Instead of throwing an error, return a default response
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
              totalPages: 0
            }
          },
          APP_DOMAIN_CDN_IMAGE: ''
        }
      } as unknown as T;
    }

    const data = await response.json();
    logger.debug(`[DEBUG] API V1 response data:`, data);
    logger.debug(`[DEBUG] API V1 response data:`, data);

    // Log detailed information about the response structure
    if (data) {
      logger.debug(`[DEBUG] API V1 response keys:`, Object.keys(data));
      logger.debug(`[DEBUG] API V1 response keys:`, Object.keys(data));
      if (data.data) {
        logger.debug(`[DEBUG] API V1 response data keys:`, Object.keys(data.data));
        logger.debug(`[DEBUG] API V1 response data keys:`, Object.keys(data.data));
        if (data.data.items) {
          logger.debug(`[DEBUG] API V1 found ${data.data.items.length} items`);
          logger.debug(`[DEBUG] API V1 found ${data.data.items.length} items`);
          if (data.data.items.length > 0) {
            logger.debug(`[DEBUG] First item:`, data.data.items[0]);
            logger.debug(`[DEBUG] First item:`, data.data.items[0]);
          }
        }
      }
    }

    return data;
  } catch (error) {
    logger.error(`[DEBUG] Error fetching from ${originalUrl}:`, error);
    // Return a default response instead of throwing an error
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
            totalPages: 0
          }
        },
        APP_DOMAIN_CDN_IMAGE: ''
      }
    } as unknown as T;
  }
}

// Hàm chuyển đổi dữ liệu API sang định dạng Movie
function mapAPIMovieToMovie(apiMovie: any): Movie {
  // Thêm domain vào đường dẫn hình ảnh nếu cần
  const fixImageUrl = (url: string | undefined) => {
    if (!url) return 'https://placehold.co/300x450?text=Movie';
    if (url.startsWith('http')) return url;
    return `https://phimimg.com/${url}`;
  };

  // Log image URLs for debugging
  logger.debug('Original thumb_url:', apiMovie.thumb_url);
  logger.debug('Fixed thumb_url:', fixImageUrl(apiMovie.thumb_url));
  logger.debug('Original thumb_url:', apiMovie.thumb_url);
  logger.debug('Fixed thumb_url:', fixImageUrl(apiMovie.thumb_url));

  return {
    _id: apiMovie._id || `sample-${Math.random().toString(36).substring(7)}`,
    name: apiMovie.name || 'Unknown Movie',
    origin_name: apiMovie.origin_name || '',
    slug: apiMovie.slug || '',
    type: apiMovie.type || 'movie',
    thumb_url: fixImageUrl(apiMovie.thumb_url),
    poster_url: fixImageUrl(apiMovie.poster_url),
    year: apiMovie.year || new Date().getFullYear(),
    time: apiMovie.time || '',
    episode_current: apiMovie.episode_current || '',
    quality: apiMovie.quality || 'HD',
    lang: apiMovie.lang || '',
    view: apiMovie.view || 0,
    category: apiMovie.category && apiMovie.category.length > 0
      ? { name: apiMovie.category[0].name, slug: apiMovie.category[0].slug }
      : null,
    country: apiMovie.country && apiMovie.country.length > 0
      ? apiMovie.country.map((c: any) => ({ name: c.name, slug: c.slug }))
      : [],
    genres: apiMovie.category && apiMovie.category.length > 0
      ? apiMovie.category.map((g: any) => ({ name: g.name, slug: g.slug }))
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
  logger.debug('Processing episodes from API response');
  logger.debug('API episodes:', JSON.stringify(apiMovie.episodes, null, 2));

  if (apiMovie.episodes && Array.isArray(apiMovie.episodes) && apiMovie.episodes.length > 0) {
    apiMovie.episodes.forEach((server: any) => {
      logger.debug('Processing server:', server.server_name);
      logger.debug('Processing server:', server.server_name);
      if (server.server_data && Array.isArray(server.server_data) && server.server_data.length > 0) {
        const serverEpisodes = {
          server_name: server.server_name,
          items: server.server_data.map((item: any) => ({
            name: item.name,
            slug: item.slug,
            filename: item.filename || `${apiMovie.slug}-${item.slug}`,
            link_embed: item.link_embed,
            link_m3u8: item.link_m3u8,
          })),
        };
        logger.debug(`Added server ${server.server_name} with ${serverEpisodes.items.length} episodes`);
        logger.debug(`Added server ${server.server_name} with ${serverEpisodes.items.length} episodes`);
        episodes.push(serverEpisodes);
      } else {
        logger.debug(`Server ${server.server_name} has no valid server_data`);
        logger.debug(`Server ${server.server_name} has no valid server_data`);
      }
    });
  } else {
    logger.debug('No valid episodes array in API response');
    logger.debug('No valid episodes array in API response');
  }

  logger.debug(`Total episodes servers processed: ${episodes.length}`);
  logger.debug(`Total episodes servers processed: ${episodes.length}`);

  return {
    ...movie,
    episodes,
  };
}

// Get new movies
export async function getNewMovies(page = PAGINATION_CONFIG.DEFAULT_PAGE, limit = PAGINATION_CONFIG.ITEMS_PER_PAGE): Promise<PaginatedResponse<Movie>> {
  try {
    logger.debug(`Fetching new movies for page: ${page}, limit: ${limit}`);
    logger.debug(`Fetching new movies for page: ${page}, limit: ${limit}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.NEW_MOVIES}`, {
      page: page.toString(),
      limit: limit.toString()
    });
    logger.debug('API Response structure:', Object.keys(response));
    logger.debug('API Response structure:', Object.keys(response));

    if (response && response.status === true) {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        logger.debug(`Found ${response.items.length} movies`);
        logger.debug('Pagination data:', response.pagination);
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
        logger.debug('No items found in API response');
      }
    } else {
      logger.debug('API response status is not true');
      logger.debug('API response status is not true');
    }

    logger.debug('API response not successful, returning empty response');
    return getEmptyResponse(page);
  } catch (error) {
    logger.error('Error fetching new movies:', error);
    logger.error('Error fetching new movies:', error);
    // Return empty response in case of error
    return getEmptyResponse(page);
  }
}

// Get movie details by slug
export async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    logger.debug(`Fetching movie detail for slug: ${slug}`);
    logger.debug(`Fetching movie detail for slug: ${slug}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);
    logger.debug('API Response:', JSON.stringify(response, null, 2));
    logger.debug('API Response:', JSON.stringify(response, null, 2));

    if (response && response.status === true && response.movie) {
      // Create a new object with both movie data and episodes
      const movieWithEpisodes = {
        ...response.movie,
        episodes: response.episodes || []
      };

      logger.debug('Movie with episodes:', JSON.stringify(movieWithEpisodes.episodes, null, 2));
      logger.debug('Movie with episodes:', JSON.stringify(movieWithEpisodes.episodes, null, 2));

      const movieDetail = mapAPIMovieToMovieDetail(movieWithEpisodes);
      logger.debug('Mapped movie detail:', JSON.stringify(movieDetail, null, 2));
      logger.debug('Mapped movie detail:', JSON.stringify(movieDetail, null, 2));
      return movieDetail;
    }

    logger.error('Empty or invalid response from API');
    logger.error('Empty or invalid response from API');
    throw new Error('Empty or invalid response from API');
  } catch (error) {
    logger.error(`Error fetching movie with slug ${slug}:`, error);
    logger.error(`Error fetching movie with slug ${slug}:`, error);
    throw error; // Throw error instead of returning sample data
  }
}

// Get movies by type_list or category
export async function getMoviesByCategory(
  typeOrCategorySlug: string,
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
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString()
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
      ...filteredOptions
    };

    // Determine if this is a category, country, or a type list
    let endpoint = '';
    const isLanguageType = ['phim-vietsub', 'phim-thuyet-minh', 'phim-long-tieng'].includes(typeOrCategorySlug);
    const isMovieType = ['phim-bo', 'phim-le', 'tv-shows', 'hoat-hinh'].includes(typeOrCategorySlug);
    const isYear = /^\d{4}$/.test(typeOrCategorySlug);

    logger.debug(`[DEBUG] getMoviesByCategory - typeOrCategorySlug: ${typeOrCategorySlug}`);
    logger.debug(`[DEBUG] getMoviesByCategory - options:`, options);
    logger.debug(`[DEBUG] getMoviesByCategory - typeOrCategorySlug: ${typeOrCategorySlug}`);
    logger.debug(`[DEBUG] getMoviesByCategory - options:`, options);

    // Check if this is a category slug
    const isCategorySlug = !isLanguageType && !isMovieType && !isYear && typeOrCategorySlug.includes('-');

    // Check if we're on the category page
    if (isCategorySlug) {
      // For categories, use the category endpoint directly
      endpoint = `${API_ENDPOINTS.V1_CATEGORY}/${typeOrCategorySlug}`;
      logger.debug(`[DEBUG] Using category endpoint for slug: ${typeOrCategorySlug}`);
      logger.debug(`[DEBUG] Using category endpoint for slug: ${typeOrCategorySlug}`);
    } else if (isYear) {
      // For years, use the movies list endpoint with year parameter
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      params.year = typeOrCategorySlug;
      logger.debug(`[DEBUG] Using year parameter: ${typeOrCategorySlug}`);
      logger.debug(`[DEBUG] Using year parameter: ${typeOrCategorySlug}`);
    } else if (isLanguageType || isMovieType) {
      // For all type lists (movie types and language types), use the danh-sach endpoint
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/${typeOrCategorySlug}`;
      logger.debug(`[DEBUG] Using type list: ${typeOrCategorySlug}`);
      logger.debug(`[DEBUG] Using type list: ${typeOrCategorySlug}`);

      // Add additional filters if provided
      if (options.category) {
        logger.debug(`[DEBUG] Adding category filter: ${options.category}`);
        logger.debug(`[DEBUG] Adding category filter: ${options.category}`);
      }

      if (options.country) {
        logger.debug(`[DEBUG] Adding country filter: ${options.country}`);
        logger.debug(`[DEBUG] Adding country filter: ${options.country}`);
      }

      if (options.year) {
        logger.debug(`[DEBUG] Adding year filter: ${options.year}`);
        logger.debug(`[DEBUG] Adding year filter: ${options.year}`);
      }
    } else {
      // Default to phim-bo if we can't determine the type
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      logger.debug(`[DEBUG] Using default type list: phim-bo`);
      logger.debug(`[DEBUG] Using default type list: phim-bo`);
    }

    logger.debug(`[DEBUG] Fetching from endpoint: ${endpoint} with params:`, JSON.stringify(params, null, 2));
    logger.debug(`[DEBUG] Fetching from endpoint: ${endpoint} with params:`, JSON.stringify(params, null, 2));
    const response = await fetchAPIV1<any>(endpoint, params);
    logger.debug(`[DEBUG] Response status:`, response.status);
    logger.debug(`[DEBUG] Response data structure:`, Object.keys(response.data || {}));
    logger.debug(`[DEBUG] Response status:`, response.status);
    logger.debug(`[DEBUG] Response data structure:`, Object.keys(response.data || {}));
    if (response.data && response.data.items) {
      logger.debug(`[DEBUG] Found ${response.data.items.length} items`);
      logger.debug(`[DEBUG] Found ${response.data.items.length} items`);
      if (response.data.items.length > 0) {
        logger.debug(`[DEBUG] First item:`, JSON.stringify(response.data.items[0], null, 2).substring(0, 200) + '...');
        logger.debug(`[DEBUG] First item:`, JSON.stringify(response.data.items[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      logger.debug(`[DEBUG] No items found in response:`, response);
      logger.debug(`[DEBUG] No items found in response:`, response);
    }

    // Process the response
    if (response && response.data) {
      // Use optional chaining and default values to handle missing properties
      const { items = [], params: responseParams = { pagination: {} }, APP_DOMAIN_CDN_IMAGE = '' } = response.data;

      // Log first item to check structure
      if (items && items.length > 0) {
        logger.debug(`Found ${items.length} movies for ${typeOrCategorySlug}`);
        logger.debug('First item:', JSON.stringify(items[0], null, 2));
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);
        logger.debug(`Found ${items.length} movies for ${typeOrCategorySlug}`);
        logger.debug('First item:', JSON.stringify(items[0], null, 2));
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map((item: { thumb_url: string; poster_url: string; }) => {
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
            totalItemsPerPage: responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
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
    logger.error(`Error fetching movies for ${typeOrCategorySlug}:`, error);
    // Return empty response in case of error
    return getEmptyResponse(page);
  }
}

// Get movies by country
export async function getMoviesByCountry(
  countrySlug: string,
  page = PAGINATION_CONFIG.DEFAULT_PAGE,
  options: {
    sort_field?: string;
    sort_type?: string;
    sort_lang?: string;
    category?: string;
    year?: string;
    limit?: string;
  } = {}
): Promise<PaginatedResponse<Movie>> {
  try {
    // Set default limit if not provided in options
    const defaultOptions = {
      limit: PAGINATION_CONFIG.ITEMS_PER_PAGE.toString(),
      sort_field: 'modified.time',
      sort_type: 'desc'
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
      ...filteredOptions
    };

    // Use the correct API endpoint for countries
    const url = `${API_ENDPOINTS.V1_COUNTRY}/${countrySlug}`;
    logger.debug(`[DEBUG] Fetching movies for country ${countrySlug}, URL: ${url}, params:`, JSON.stringify(params, null, 2));
    logger.debug(`[DEBUG] Fetching movies for country ${countrySlug}, URL: ${url}, params:`, JSON.stringify(params, null, 2));

    const response = await fetchAPIV1<any>(url, params);
    logger.debug(`[DEBUG] Country response status:`, response.status);
    logger.debug(`[DEBUG] Country response full:`, response);
    logger.debug(`[DEBUG] Country response status:`, response.status);
    logger.debug(`[DEBUG] Country response full:`, response);

    if (response.data) {
      logger.debug(`[DEBUG] Country response data keys:`, Object.keys(response.data));
      logger.debug(`[DEBUG] Country response data keys:`, Object.keys(response.data));

      if (response.data.items) {
        logger.debug(`[DEBUG] Found ${response.data.items.length} items for country ${countrySlug}`);
        logger.debug(`[DEBUG] Found ${response.data.items.length} items for country ${countrySlug}`);
        if (response.data.items.length > 0) {
          logger.debug(`[DEBUG] First country item:`, response.data.items[0]);
          logger.debug(`[DEBUG] First country item:`, response.data.items[0]);
        }
      } else {
        logger.debug(`[DEBUG] No items found in country response data`);
        logger.debug(`[DEBUG] No items found in country response data`);
      }
    } else {
      logger.debug(`[DEBUG] No data found in country response`);
      logger.debug(`[DEBUG] No data found in country response`);
    }

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

      if (items && items.length > 0) {
        logger.debug(`Found ${items.length} movies for country ${countrySlug}`);
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);
        logger.debug(`Found ${items.length} movies for country ${countrySlug}`);
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map((item: { thumb_url: string; poster_url: string; }) => {
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
            totalItemsPerPage: responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: responseParams.pagination?.currentPage || page,
            totalPages: responseParams.pagination?.totalPages || 1,
          },
        };
      }
    }

    throw new Error('Empty response from API');
  } catch (error) {
    logger.error(`Error fetching movies for country ${countrySlug}:`, error);
    logger.error(`Error fetching movies for country ${countrySlug}:`, error);
    // Return empty response in case of error
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
      sort_type: 'desc'
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
      year: year // Add year as a parameter instead of part of the URL
    };

    // Use the movies list API endpoint with year as a parameter
    const url = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`; // Use phim-bo as the base type
    logger.debug(`Fetching movies for year ${year}, URL: ${url}, params:`, params);
    logger.debug(`Fetching movies for year ${year}, URL: ${url}, params:`, params);

    try {
      const response = await fetchAPIV1<any>(url, params);
      logger.debug(`API response for year ${year}:`, response);
      logger.debug(`API response for year ${year}:`, response);

      if (response && response.status === 'success' && response.data) {
        const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

        if (items && items.length > 0) {
          logger.debug(`Found ${items.length} movies for year ${year}`);
          logger.debug('Pagination data:', responseParams.pagination);
          logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);
          logger.debug(`Found ${items.length} movies for year ${year}`);
          logger.debug('Pagination data:', responseParams.pagination);
          logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

          // Add image domain to each item
          const processedItems = items.map((item: { thumb_url: string; poster_url: string; }) => {
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
              totalItemsPerPage: responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
              currentPage: responseParams.pagination?.currentPage || page,
              totalPages: responseParams.pagination?.totalPages || 1,
            },
          };
        }
      }

      // If we get here, the response didn't have the expected structure
      logger.error(`Invalid response structure for year ${year}:`, response);
      logger.error(`Invalid response structure for year ${year}:`, response);
      throw new Error('Invalid API response structure');
    } catch (error) {
      logger.error(`Error in fetchAPIV1 for year ${year}:`, error);
      logger.error(`Error in fetchAPIV1 for year ${year}:`, error);
      throw error;
    }
  } catch (error) {
    logger.error(`Error fetching movies for year ${year}:`, error);
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
      sort_type: 'desc'
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
      ...filteredOptions
    };

    logger.debug(`Searching for movies with keyword: ${keyword}, params:`, params);
    logger.debug(`Searching for movies with keyword: ${keyword}, params:`, params);
    const response = await fetchAPIV1<any>(`${API_ENDPOINTS.V1_SEARCH}`, params);

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

      if (items && items.length > 0) {
        logger.debug(`Found ${items.length} movies for search keyword ${keyword}`);
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);
        logger.debug(`Found ${items.length} movies for search keyword ${keyword}`);
        logger.debug('Pagination data:', responseParams.pagination);
        logger.debug('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map((item: { thumb_url: string; poster_url: string; }) => {
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
            totalItemsPerPage: responseParams.pagination?.totalItemsPerPage || PAGINATION_CONFIG.ITEMS_PER_PAGE,
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
export async function getCategories(): Promise<any[]> {
  try {
    logger.debug('[DEBUG] Fetching categories from:', `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`);
    logger.debug('[DEBUG] Fetching categories from:', `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`);

    // Use fetch directly with a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`, {
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error(`[DEBUG] Categories API error: ${response.status}`);
      logger.error(`[DEBUG] Categories API error: ${response.status}`);
      return getSampleCategories();
    }

    const data = await response.json();
    logger.debug('[DEBUG] Categories response:', data);
    logger.debug('[DEBUG] Categories response:', data);

    if (Array.isArray(data)) {
      return data.map(category => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
      }));
    } else {
      logger.error('[DEBUG] Categories response is not an array:', data);
      logger.error('[DEBUG] Categories response is not an array:', data);
      return getSampleCategories();
    }
  } catch (error) {
    logger.error('Error fetching categories:', error);
    logger.error('Error fetching categories:', error);
    return getSampleCategories();
  }
}

// Get countries
export async function getCountries(): Promise<any[]> {
  try {
    logger.debug('[DEBUG] Fetching countries from:', `${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`);
    logger.debug('[DEBUG] Fetching countries from:', `${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`);

    // Use fetch directly with a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`, {
      signal: controller.signal,
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error(`[DEBUG] Countries API error: ${response.status}`);
      logger.error(`[DEBUG] Countries API error: ${response.status}`);
      return getSampleCountries();
    }

    const data = await response.json();
    logger.debug('[DEBUG] Countries response:', data);
    logger.debug('[DEBUG] Countries response:', data);

    if (Array.isArray(data)) {
      return data.map(country => ({
        id: country._id,
        name: country.name,
        slug: country.slug,
      }));
    } else {
      logger.error('[DEBUG] Countries response is not an array:', data);
      logger.error('[DEBUG] Countries response is not an array:', data);
      return getSampleCountries();
    }
  } catch (error) {
    logger.error('Error fetching countries:', error);
    logger.error('Error fetching countries:', error);
    return getSampleCountries();
  }
}

// Helper function to generate empty response
function getEmptyResponse(page = 1, limit = PAGINATION_CONFIG.ITEMS_PER_PAGE): PaginatedResponse<Movie> {
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

// Helper function to generate sample categories
function getSampleCategories() {
  return [
    { id: 'cat-1', name: 'Hành Động', slug: 'hanh-dong' },
    { id: 'cat-2', name: 'Tình Cảm', slug: 'tinh-cam' },
    { id: 'cat-3', name: 'Hài Hước', slug: 'hai-huoc' },
    { id: 'cat-4', name: 'Cổ Trang', slug: 'co-trang' },
    { id: 'cat-5', name: 'Tâm Lý', slug: 'tam-ly' },
    { id: 'cat-6', name: 'Hình Sự', slug: 'hinh-su' },
    { id: 'cat-7', name: 'Chiến Tranh', slug: 'chien-tranh' },
    { id: 'cat-8', name: 'Thể Thao', slug: 'the-thao' },
    { id: 'cat-9', name: 'Võ Thuật', slug: 'vo-thuat' },
    { id: 'cat-10', name: 'Viễn Tưởng', slug: 'vien-tuong' },
    { id: 'cat-11', name: 'Phiêu Lưu', slug: 'phieu-luu' },
    { id: 'cat-12', name: 'Khoa Học', slug: 'khoa-hoc' },
    { id: 'cat-13', name: 'Kinh Dị', slug: 'kinh-di' },
    { id: 'cat-14', name: 'Âm Nhạc', slug: 'am-nhac' },
    { id: 'cat-15', name: 'Thần Thoại', slug: 'than-thoai' },
    { id: 'cat-16', name: 'Tài Liệu', slug: 'tai-lieu' },
    { id: 'cat-17', name: 'Gia Đình', slug: 'gia-dinh' },
    { id: 'cat-18', name: 'Chính Kịch', slug: 'chinh-kich' },
    { id: 'cat-19', name: 'Bí Ẩn', slug: 'bi-an' },
    { id: 'cat-20', name: 'Học Đường', slug: 'hoc-duong' },
  ];
}

// Helper function to generate sample countries
function getSampleCountries() {
  return [
    { id: 'country-1', name: 'Việt Nam', slug: 'viet-nam' },
    { id: 'country-2', name: 'Trung Quốc', slug: 'trung-quoc' },
    { id: 'country-3', name: 'Hàn Quốc', slug: 'han-quoc' },
    { id: 'country-4', name: 'Nhật Bản', slug: 'nhat-ban' },
    { id: 'country-5', name: 'Thái Lan', slug: 'thai-lan' },
    { id: 'country-6', name: 'Âu Mỹ', slug: 'au-my' },
    { id: 'country-7', name: 'Đài Loan', slug: 'dai-loan' },
    { id: 'country-8', name: 'Hồng Kông', slug: 'hong-kong' },
    { id: 'country-9', name: 'Ấn Độ', slug: 'an-do' },
    { id: 'country-10', name: 'Anh', slug: 'anh' },
    { id: 'country-11', name: 'Pháp', slug: 'phap' },
    { id: 'country-12', name: 'Canada', slug: 'canada' },
    { id: 'country-13', name: 'Quốc Gia Khác', slug: 'quoc-gia-khac' },
  ];
}

// Client-side paginated versions of API functions
export async function getNewMoviesClientPaginated(clientPage = 1): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    (apiPage) => getNewMovies(apiPage),
    clientPage
  );
}

export async function getMoviesByCategoryClientPaginated(
  typeOrCategorySlug: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    (apiPage) => getMoviesByCategory(typeOrCategorySlug, apiPage, options),
    clientPage
  );
}

export async function getMoviesByCountryClientPaginated(
  countrySlug: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    (apiPage) => getMoviesByCountry(countrySlug, apiPage, options),
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
      (apiPage) => searchMovies(keyword, apiPage, options),
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
  logger.debug(`[DEBUG] getMoviesByYearClientPaginated called with year: ${year}, clientPage: ${clientPage}, options:`, options);
  logger.debug(`[DEBUG] getMoviesByYearClientPaginated called with year: ${year}, clientPage: ${clientPage}, options:`, options);

  try {
    const result = await fetchMultiplePages<Movie>(
      (apiPage) => getMoviesByYear(year, apiPage, options),
      clientPage
    );

    logger.debug(`[DEBUG] getMoviesByYearClientPaginated result for year ${year}:`, {
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      movieCount: result.data.length
    });

    return result;
  } catch (error) {
    logger.error(`[DEBUG] Error in getMoviesByYearClientPaginated for year ${year}:`, error);
    logger.error(`[DEBUG] Error in getMoviesByYearClientPaginated for year ${year}:`, error);
    throw error;
  }
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMoviesClientPaginated;
export const getTVShows = (page = 1) => getMoviesByCategoryClientPaginated('phim-bo', page);
export const getMoviesByGenre = getMoviesByCategoryClientPaginated;
export const getMovieBySlug = getMovieDetail;
