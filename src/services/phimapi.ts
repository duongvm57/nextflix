// API service for phimapi.com
import { Movie, MovieDetail, PaginatedResponse, Episode } from '@/types';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';

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

  console.log(`[DEBUG] fetchMultiplePages - clientPage: ${clientPage}, startApiPage: ${startApiPage}`);

  try {
    // Fetch two consecutive API pages
    console.log(`[DEBUG] fetchMultiplePages - Fetching API pages ${startApiPage} and ${startApiPage + 1}`);

    // Fetch pages one at a time for better error handling
    const page1Response = await fetchFunction(startApiPage);
    console.log(`[DEBUG] fetchMultiplePages - Page ${startApiPage} response:`, {
      totalItems: page1Response.pagination.totalItems,
      totalPages: page1Response.pagination.totalPages,
      itemCount: page1Response.data.length
    });

    let page2Response;
    try {
      page2Response = await fetchFunction(startApiPage + 1);
      console.log(`[DEBUG] fetchMultiplePages - Page ${startApiPage + 1} response:`, {
        totalItems: page2Response.pagination.totalItems,
        totalPages: page2Response.pagination.totalPages,
        itemCount: page2Response.data.length
      });
    } catch (error) {
      console.error(`[DEBUG] fetchMultiplePages - Error fetching page ${startApiPage + 1}:`, error);
      // If second page fails, just use the first page
      page2Response = { data: [], pagination: page1Response.pagination };
    }

    // Combine the items from both pages
    const combinedItems = [...page1Response.data, ...page2Response.data];
    console.log(`[DEBUG] fetchMultiplePages - Combined ${combinedItems.length} items`);

    // Calculate total client pages based on total items and items per client page
    const totalApiItems = page1Response.pagination.totalItems;
    const totalClientPages = Math.ceil(totalApiItems / itemsPerClientPage);

    console.log(`[DEBUG] fetchMultiplePages - totalApiItems: ${totalApiItems}, totalClientPages: ${totalClientPages}`);

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
    console.error('[DEBUG] Error in fetchMultiplePages:', error);
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
console.log('API endpoints:', API_ENDPOINTS);
console.log('API V1 base URL:', API_V1_BASE_URL);

// Hàm chung để gọi API
async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  console.log(`[DEBUG] Fetching API: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[DEBUG] API error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[DEBUG] API response:`, data);
    return data;
  } catch (error) {
    console.error(`[DEBUG] Error fetching from ${url}:`, error);
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
  const url = `${API_V1_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  console.log(`[DEBUG] Fetching API V1: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to ensure fresh data
      next: { revalidate: 0 } // Disable Next.js cache
    });

    console.log(`[DEBUG] API V1 response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[DEBUG] API V1 error: ${response.status}`);
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
    console.log(`[DEBUG] API V1 response data:`, data);

    // Log detailed information about the response structure
    if (data) {
      console.log(`[DEBUG] API V1 response keys:`, Object.keys(data));
      if (data.data) {
        console.log(`[DEBUG] API V1 response data keys:`, Object.keys(data.data));
        if (data.data.items) {
          console.log(`[DEBUG] API V1 found ${data.data.items.length} items`);
          if (data.data.items.length > 0) {
            console.log(`[DEBUG] First item:`, data.data.items[0]);
          }
        }
      }
    }

    return data;
  } catch (error) {
    console.error(`[DEBUG] Error fetching from ${url}:`, error);
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
  console.log('Original thumb_url:', apiMovie.thumb_url);
  console.log('Fixed thumb_url:', fixImageUrl(apiMovie.thumb_url));

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
  // Thêm domain vào đường dẫn hình ảnh nếu cần
  const fixImageUrl = (url: string | undefined) => {
    if (!url) return 'https://placehold.co/300x450?text=Movie';
    if (url.startsWith('http')) return url;
    return `https://phimimg.com/${url}`;
  };

  const movie = mapAPIMovieToMovie(apiMovie);

  // Chuyển đổi episodes từ API sang định dạng của ứng dụng
  const episodes: Episode[] = [];

  console.log('Processing episodes from API response');
  console.log('API episodes:', JSON.stringify(apiMovie.episodes, null, 2));

  if (apiMovie.episodes && Array.isArray(apiMovie.episodes) && apiMovie.episodes.length > 0) {
    apiMovie.episodes.forEach((server: any) => {
      console.log('Processing server:', server.server_name);
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
        console.log(`Added server ${server.server_name} with ${serverEpisodes.items.length} episodes`);
        episodes.push(serverEpisodes);
      } else {
        console.log(`Server ${server.server_name} has no valid server_data`);
      }
    });
  } else {
    console.log('No valid episodes array in API response');
  }

  console.log(`Total episodes servers processed: ${episodes.length}`);

  return {
    ...movie,
    episodes,
  };
}

// Get new movies
export async function getNewMovies(page = PAGINATION_CONFIG.DEFAULT_PAGE, limit = PAGINATION_CONFIG.ITEMS_PER_PAGE): Promise<PaginatedResponse<Movie>> {
  try {
    console.log(`Fetching new movies for page: ${page}, limit: ${limit}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.NEW_MOVIES}`, {
      page: page.toString(),
      limit: limit.toString()
    });
    console.log('API Response structure:', Object.keys(response));

    if (response && response.status === true) {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        console.log(`Found ${response.items.length} movies`);
        console.log('Pagination data:', response.pagination);

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
        console.log('No items found in API response');
      }
    } else {
      console.log('API response status is not true');
    }

    console.log('API response not successful, using sample data');
    return getSampleMovieData(page);
  } catch (error) {
    console.error('Error fetching new movies:', error);
    // Return sample data in case of error
    return getSampleMovieData(page);
  }
}

// Get movie details by slug
export async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    console.log(`Fetching movie detail for slug: ${slug}`);
    const response = await fetchAPI<any>(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);
    console.log('API Response:', JSON.stringify(response, null, 2));

    if (response && response.status === true && response.movie) {
      // Create a new object with both movie data and episodes
      const movieWithEpisodes = {
        ...response.movie,
        episodes: response.episodes || []
      };

      console.log('Movie with episodes:', JSON.stringify(movieWithEpisodes.episodes, null, 2));

      const movieDetail = mapAPIMovieToMovieDetail(movieWithEpisodes);
      console.log('Mapped movie detail:', JSON.stringify(movieDetail, null, 2));
      return movieDetail;
    }

    console.error('Empty or invalid response from API');
    throw new Error('Empty or invalid response from API');
  } catch (error) {
    console.error(`Error fetching movie with slug ${slug}:`, error);
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

    console.log(`[DEBUG] getMoviesByCategory - typeOrCategorySlug: ${typeOrCategorySlug}`);
    console.log(`[DEBUG] getMoviesByCategory - options:`, options);

    // Check if this is a category slug
    const isCategorySlug = !isLanguageType && !isMovieType && !isYear && typeOrCategorySlug.includes('-');

    // Check if we're on the category page
    if (isCategorySlug) {
      // For categories, use the category endpoint directly
      endpoint = `${API_ENDPOINTS.V1_CATEGORY}/${typeOrCategorySlug}`;
      console.log(`[DEBUG] Using category endpoint for slug: ${typeOrCategorySlug}`);
    } else if (isYear) {
      // For years, use the movies list endpoint with year parameter
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      params.year = typeOrCategorySlug;
      console.log(`[DEBUG] Using year parameter: ${typeOrCategorySlug}`);
    } else if (isLanguageType || isMovieType) {
      // For all type lists (movie types and language types), use the danh-sach endpoint
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/${typeOrCategorySlug}`;
      console.log(`[DEBUG] Using type list: ${typeOrCategorySlug}`);

      // Add additional filters if provided
      if (options.category) {
        console.log(`[DEBUG] Adding category filter: ${options.category}`);
      }

      if (options.country) {
        console.log(`[DEBUG] Adding country filter: ${options.country}`);
      }

      if (options.year) {
        console.log(`[DEBUG] Adding year filter: ${options.year}`);
      }
    } else {
      // Default to phim-bo if we can't determine the type
      endpoint = `${API_ENDPOINTS.V1_MOVIES_LIST}/phim-bo`;
      console.log(`[DEBUG] Using default type list: phim-bo`);
    }

    console.log(`[DEBUG] Fetching from endpoint: ${endpoint} with params:`, JSON.stringify(params, null, 2));
    const response = await fetchAPIV1<any>(endpoint, params);
    console.log(`[DEBUG] Response status:`, response.status);
    console.log(`[DEBUG] Response data structure:`, Object.keys(response.data || {}));
    if (response.data && response.data.items) {
      console.log(`[DEBUG] Found ${response.data.items.length} items`);
      if (response.data.items.length > 0) {
        console.log(`[DEBUG] First item:`, JSON.stringify(response.data.items[0], null, 2).substring(0, 200) + '...');
      }
    } else {
      console.log(`[DEBUG] No items found in response:`, response);
    }

    // Process the response
    if (response && response.data) {
      // Use optional chaining and default values to handle missing properties
      const { items = [], params: responseParams = { pagination: {} }, APP_DOMAIN_CDN_IMAGE = '' } = response.data;

      // Log first item to check structure
      if (items && items.length > 0) {
        console.log(`Found ${items.length} movies for ${typeOrCategorySlug}`);
        console.log('First item:', JSON.stringify(items[0], null, 2));
        console.log('Pagination data:', responseParams.pagination);
        console.log('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map(item => {
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
    console.log(`No valid data found for ${typeOrCategorySlug}, returning sample data`);
    return getSampleMovieData(page, `${typeOrCategorySlug.charAt(0).toUpperCase() + typeOrCategorySlug.slice(1)} Movie`);
  } catch (error) {
    console.error(`Error fetching movies for ${typeOrCategorySlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${typeOrCategorySlug.charAt(0).toUpperCase() + typeOrCategorySlug.slice(1)} Movie`);
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
    console.log(`[DEBUG] Fetching movies for country ${countrySlug}, URL: ${url}, params:`, JSON.stringify(params, null, 2));

    const response = await fetchAPIV1<any>(url, params);
    console.log(`[DEBUG] Country response status:`, response.status);
    console.log(`[DEBUG] Country response full:`, response);

    if (response.data) {
      console.log(`[DEBUG] Country response data keys:`, Object.keys(response.data));

      if (response.data.items) {
        console.log(`[DEBUG] Found ${response.data.items.length} items for country ${countrySlug}`);
        if (response.data.items.length > 0) {
          console.log(`[DEBUG] First country item:`, response.data.items[0]);
        }
      } else {
        console.log(`[DEBUG] No items found in country response data`);
      }
    } else {
      console.log(`[DEBUG] No data found in country response`);
    }

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

      if (items && items.length > 0) {
        console.log(`Found ${items.length} movies for country ${countrySlug}`);
        console.log('Pagination data:', responseParams.pagination);
        console.log('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map(item => {
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
    console.error(`Error fetching movies for country ${countrySlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1)} Movie`);
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
    console.log(`Fetching movies for year ${year}, URL: ${url}, params:`, params);

    try {
      const response = await fetchAPIV1<any>(url, params);
      console.log(`API response for year ${year}:`, response);

      if (response && response.status === 'success' && response.data) {
        const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

        if (items && items.length > 0) {
          console.log(`Found ${items.length} movies for year ${year}`);
          console.log('Pagination data:', responseParams.pagination);
          console.log('Image domain:', APP_DOMAIN_CDN_IMAGE);

          // Add image domain to each item
          const processedItems = items.map(item => {
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
      console.error(`Invalid response structure for year ${year}:`, response);
      throw new Error('Invalid API response structure');
    } catch (error) {
      console.error(`Error in fetchAPIV1 for year ${year}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error fetching movies for year ${year}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${year} Movie`);
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

    console.log(`Searching for movies with keyword: ${keyword}, params:`, params);
    const response = await fetchAPIV1<any>(`${API_ENDPOINTS.V1_SEARCH}`, params);

    if (response && response.status === 'success' && response.data) {
      const { items, params: responseParams, APP_DOMAIN_CDN_IMAGE } = response.data;

      if (items && items.length > 0) {
        console.log(`Found ${items.length} movies for search keyword ${keyword}`);
        console.log('Pagination data:', responseParams.pagination);
        console.log('Image domain:', APP_DOMAIN_CDN_IMAGE);

        // Add image domain to each item
        const processedItems = items.map(item => {
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
    console.error(`Error searching for movies with keyword ${keyword}:`, error);
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
    console.log('[DEBUG] Fetching categories from:', `${API_BASE_URL}${API_ENDPOINTS.CATEGORIES_LIST}`);

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
      console.error(`[DEBUG] Categories API error: ${response.status}`);
      return getSampleCategories();
    }

    const data = await response.json();
    console.log('[DEBUG] Categories response:', data);

    if (Array.isArray(data)) {
      return data.map(category => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
      }));
    } else {
      console.error('[DEBUG] Categories response is not an array:', data);
      return getSampleCategories();
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return getSampleCategories();
  }
}

// Get countries
export async function getCountries(): Promise<any[]> {
  try {
    console.log('[DEBUG] Fetching countries from:', `${API_BASE_URL}${API_ENDPOINTS.COUNTRIES_LIST}`);

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
      console.error(`[DEBUG] Countries API error: ${response.status}`);
      return getSampleCountries();
    }

    const data = await response.json();
    console.log('[DEBUG] Countries response:', data);

    if (Array.isArray(data)) {
      return data.map(country => ({
        id: country._id,
        name: country.name,
        slug: country.slug,
      }));
    } else {
      console.error('[DEBUG] Countries response is not an array:', data);
      return getSampleCountries();
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    return getSampleCountries();
  }
}

// Helper function to generate sample movie data
function getSampleMovieData(page = 1, prefix = 'Sample Movie', limit = PAGINATION_CONFIG.ITEMS_PER_PAGE): PaginatedResponse<Movie> {
  return {
    data: Array(limit).fill(null).map((_, index) => ({
      _id: `sample-${index}`,
      name: `${prefix} ${index + 1}`,
      origin_name: `${prefix} Origin Name ${index + 1}`,
      slug: `sample-movie-${index + 1}`,
      type: index % 3 === 0 ? 'tv_series' : 'movie',
      thumb_url: 'https://placehold.co/300x450?text=Movie',
      poster_url: 'https://placehold.co/900x450?text=Movie',
      year: 2023,
      time: '120 min',
      episode_current: index % 3 === 0 ? '10' : '1',
      quality: 'HD',
      lang: 'Vietsub',
      view: 1000 + index * 100,
      status: 'ongoing',
      category: { name: 'Action', slug: 'action' },
      country: [{ name: 'USA', slug: 'usa' }],
      genres: [{ name: 'Action', slug: 'action' }],
      actors: ['Actor 1', 'Actor 2'],
      directors: ['Director'],
      duration: '120 min',
      content: 'Sample movie description',
    })),
    pagination: {
      totalItems: 100,
      totalItemsPerPage: limit,
      currentPage: page,
      totalPages: 5,
    },
  };
}

// Helper function to generate sample movie detail
function getSampleMovieDetail(slug: string): MovieDetail {
  return {
    _id: 'sample-id',
    name: 'Sample Movie Detail',
    origin_name: 'Sample Origin Name',
    slug: slug,
    type: 'movie',
    thumb_url: 'https://placehold.co/300x450?text=Movie',
    poster_url: 'https://placehold.co/900x450?text=Movie',
    year: 2023,
    time: '120 min',
    episode_current: '1',
    quality: 'HD',
    lang: 'Vietsub',
    view: 5000,
    status: 'ongoing',
    content: 'This is a sample movie description.',
    category: { name: 'Action', slug: 'action' },
    country: [{ name: 'USA', slug: 'usa' }],
    genres: [{ name: 'Action', slug: 'action' }],
    actors: ['Actor 1', 'Actor 2'],
    directors: ['Director'],
    duration: '120 min',
    episodes: [
      {
        server_name: 'Default Server',
        items: [
          {
            name: 'Full',
            slug: 'full',
            filename: `${slug}-full`,
            link_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            link_m3u8: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
    ],
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

export async function searchMoviesClientPaginated(
  keyword: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  return fetchMultiplePages<Movie>(
    (apiPage) => searchMovies(keyword, apiPage, options),
    clientPage
  );
}

export async function getMoviesByYearClientPaginated(
  year: string,
  clientPage = 1,
  options = {}
): Promise<PaginatedResponse<Movie>> {
  console.log(`[DEBUG] getMoviesByYearClientPaginated called with year: ${year}, clientPage: ${clientPage}, options:`, options);

  try {
    const result = await fetchMultiplePages<Movie>(
      (apiPage) => getMoviesByYear(year, apiPage, options),
      clientPage
    );

    console.log(`[DEBUG] getMoviesByYearClientPaginated result for year ${year}:`, {
      totalItems: result.pagination.totalItems,
      totalPages: result.pagination.totalPages,
      currentPage: result.pagination.currentPage,
      movieCount: result.data.length
    });

    return result;
  } catch (error) {
    console.error(`[DEBUG] Error in getMoviesByYearClientPaginated for year ${year}:`, error);
    throw error;
  }
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMoviesClientPaginated;
export const getTVShows = (page = 1) => getMoviesByCategoryClientPaginated('phim-bo', page);
export const getMoviesByGenre = getMoviesByCategoryClientPaginated;
export const getMovieBySlug = getMovieDetail;
