// API service for phim.nguonc.com
import { Movie, PaginatedResponse, Category, Country } from '@/types';

const API_BASE_URL = 'https://phim.nguonc.com/api';

// Các endpoint API theo tài liệu
const API_ENDPOINTS = {
  // Danh sách phim
  NEW_MOVIES: '/films/phim-moi-cap-nhat',
  MOVIES_BY_CATEGORY: '/films/the-loai',

  // Thông tin phim
  MOVIE_DETAIL: '/film',

  // Thể loại, quốc gia, năm
  MOVIES_BY_GENRE: '/films/the-loai',
  MOVIES_BY_COUNTRY: '/films/quoc-gia',
  MOVIES_BY_YEAR: '/films/nam-phat-hanh',

  // Tìm kiếm
  SEARCH: '/films/search',
};

// Hàm chung để gọi API
async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

// Hàm chuyển đổi dữ liệu API sang định dạng Movie
function mapAPIMovieToMovie(apiMovie: any): Movie {
  return {
    _id: apiMovie.id || apiMovie._id || `sample-${Math.random().toString(36).substring(7)}`,
    name: apiMovie.name || 'Unknown Movie',
    origin_name: apiMovie.original_name || apiMovie.originalName || '',
    slug: apiMovie.slug || '',
    type: apiMovie.type || 'movie',
    thumb_url: apiMovie.thumb_url || apiMovie.posterUrl || 'https://placehold.co/300x450?text=Movie',
    poster_url: apiMovie.poster_url || apiMovie.backdropUrl || 'https://placehold.co/900x450?text=Movie',
    year: apiMovie.year || new Date().getFullYear(),
    time: apiMovie.time || apiMovie.duration || '',
    episode_current: apiMovie.current_episode || apiMovie.episode_current || '1',
    quality: apiMovie.quality || 'HD',
    lang: apiMovie.language || apiMovie.lang || 'Vietsub',
    view: apiMovie.view || 0,
    category: apiMovie.category || { name: 'Unknown', slug: 'unknown' },
    country: apiMovie.country || [{ name: 'Unknown', slug: 'unknown' }],
    genres: apiMovie.genres || [{ name: 'Unknown', slug: 'unknown' }],
    status: apiMovie.status || 'ongoing',
    actors: apiMovie.casts ? apiMovie.casts.split(', ') : [],
    directors: apiMovie.director ? apiMovie.director.split(', ') : [],
    duration: apiMovie.time || '',
    content: apiMovie.description || '',
  };
}

// Get list of new movies with pagination
export async function getNewMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(API_ENDPOINTS.NEW_MOVIES, { page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error('Error fetching new movies:', error);
    // Return sample data in case of error
    return getSampleMovieData(page);
  }
}

// Get list of movies by category
export async function getMoviesByCategory(categorySlug: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIES_BY_CATEGORY}/${categorySlug}`, { page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movies for category ${categorySlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Movie`);
  }
}

// Get movie details by slug
export async function getMovieBySlug(slug: string): Promise<any> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);

    if (response && response.data) {
      return {
        ...mapAPIMovieToMovie(response.data),
        episodes: response.data.episodes || [],
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movie with slug ${slug}:`, error);
    // Return sample data in case of error
    return getSampleMovieDetail(slug);
  }
}

// Get movies by genre
export async function getMoviesByGenre(genreSlug: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIES_BY_GENRE}/${genreSlug}`, { page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movies for genre ${genreSlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1)} Movie`);
  }
}

// Get movies by country
export async function getMoviesByCountry(countrySlug: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIES_BY_COUNTRY}/${countrySlug}`, { page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movies for country ${countrySlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1)} Movie`);
  }
}

// Get movies by year
export async function getMoviesByYear(year: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIES_BY_YEAR}/${year}`, { page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movies for year ${year}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${year} Movie`);
  }
}

// Search movies
export async function searchMovies(keyword: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(API_ENDPOINTS.SEARCH, { keyword, page: page.toString() });

    if (response && response.status === 'success' && response.items && response.items.length > 0) {
      return {
        data: response.items.map(mapAPIMovieToMovie),
        pagination: {
          totalItems: response.paginate.total_items || 0,
          totalItemsPerPage: response.paginate.items_per_page || 10,
          currentPage: response.paginate.current_page || page,
          totalPages: response.paginate.total_page || 1,
        },
      };
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error('Error searching movies:', error);
    // Return sample data in case of error
    return getSampleSearchResults(keyword, page);
  }
}

// Helper function to generate sample movie data
function getSampleMovieData(page = 1, prefix = 'Sample Movie', limit = 24): PaginatedResponse<Movie> {
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
      totalPages: Math.ceil(100 / limit),
    },
  };
}

// Helper function to generate sample movie detail
function getSampleMovieDetail(slug: string): any {
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
        server_name: 'Server 1',
        server_data: [
          {
            name: 'Full',
            slug: 'full',
            filename: 'Sample filename',
            link_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            link_m3u8: '',
          },
        ],
      },
    ],
  };
}

// Helper function to generate sample search results
function getSampleSearchResults(keyword: string, page = 1, limit = 24): PaginatedResponse<Movie> {
  const count = Math.min(limit, 5);
  return {
    data: Array(count).fill(null).map((_, index) => ({
      _id: `search-${index}`,
      name: `${keyword} Result ${index + 1}`,
      origin_name: `${keyword} Origin Name ${index + 1}`,
      slug: `${keyword.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      type: index % 2 === 0 ? 'movie' : 'tv_series',
      thumb_url: 'https://placehold.co/300x450?text=Search',
      poster_url: 'https://placehold.co/900x450?text=Search',
      year: 2023,
      time: '120 min',
      episode_current: index % 2 === 0 ? '1' : '10',
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
      totalItems: count,
      totalItemsPerPage: limit,
      currentPage: page,
      totalPages: 1,
    },
  };
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMovies;
export const getTVShows = (page = 1) => getMoviesByCategory('phim-bo', page);
