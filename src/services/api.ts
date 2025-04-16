// API service for phim.nguonc.com
const API_BASE_URL = 'https://phim.nguonc.com/api/v1';

// We'll use the Movie interface from types/index.ts

import { Movie, Category, Country } from '@/types';

export interface MovieListResponse {
  status: boolean;
  items: Movie[];
  params: {
    pagination: {
      totalItems: number;
      totalItemsPerPage: number;
      currentPage: number;
      totalPages: number;
    };
  };
}

export interface ApiCategory extends Category {
  id: string;
}

export interface CategoryListResponse {
  status: boolean;
  items: ApiCategory[];
}

export interface ApiCountry extends Country {
  id: string;
}

export interface CountryListResponse {
  status: boolean;
  items: ApiCountry[];
}

// Get list of movies with pagination
export async function getMovies(page = 1, limit = 24): Promise<MovieListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/list/movie?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    // Return sample data in case of error
    return {
      status: true,
      items: Array(limit).fill(null).map((_, index) => ({
        _id: `sample-${index}`,
        name: `Sample Movie ${index + 1}`,
        origin_name: `Sample Origin Name ${index + 1}`,
        slug: `sample-movie-${index + 1}`,
        type: 'movie',
        thumb_url: 'https://placehold.co/300x450?text=Movie',
        poster_url: 'https://placehold.co/900x450?text=Movie',
        year: 2023,
        time: '120 min',
        episode_current: '1',
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
      params: {
        pagination: {
          totalItems: 100,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(100 / limit),
        },
      },
    };
  }
}

// Get list of TV shows with pagination
export async function getTVShows(page = 1, limit = 24): Promise<MovieListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/list/tv?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    // Return sample data in case of error
    return {
      status: true,
      items: Array(limit).fill(null).map((_, index) => ({
        _id: `sample-tv-${index}`,
        name: `Sample TV Show ${index + 1}`,
        origin_name: `Sample TV Origin Name ${index + 1}`,
        slug: `sample-tv-show-${index + 1}`,
        type: 'tv_series',
        thumb_url: 'https://placehold.co/300x450?text=TV+Show',
        poster_url: 'https://placehold.co/900x450?text=TV+Show',
        year: 2023,
        time: '45 min/ep',
        episode_current: '10',
        quality: 'HD',
        lang: 'Vietsub',
        view: 2000 + index * 200,
        status: 'ongoing',
        category: { name: 'Drama', slug: 'drama' },
        country: [{ name: 'Korea', slug: 'korea' }],
        genres: [{ name: 'Drama', slug: 'drama' }],
        actors: ['Actor 1', 'Actor 2'],
        directors: ['Director'],
        duration: '45 min/ep',
        content: 'Sample TV show description',
      })),
      params: {
        pagination: {
          totalItems: 100,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(100 / limit),
        },
      },
    };
  }
}

// Get list of categories
export async function getCategories(): Promise<CategoryListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/category`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return sample data in case of error
    return {
      status: true,
      items: [
        { id: '1', name: 'Action', slug: 'action' },
        { id: '2', name: 'Comedy', slug: 'comedy' },
        { id: '3', name: 'Drama', slug: 'drama' },
        { id: '4', name: 'Horror', slug: 'horror' },
        { id: '5', name: 'Romance', slug: 'romance' },
        { id: '6', name: 'Sci-Fi', slug: 'sci-fi' },
      ],
    };
  }
}

// Get list of countries
export async function getCountries(): Promise<CountryListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/country`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return sample data in case of error
    return {
      status: true,
      items: [
        { id: '1', name: 'USA', slug: 'usa' },
        { id: '2', name: 'Korea', slug: 'korea' },
        { id: '3', name: 'China', slug: 'china' },
        { id: '4', name: 'Japan', slug: 'japan' },
        { id: '5', name: 'Thailand', slug: 'thailand' },
        { id: '6', name: 'Vietnam', slug: 'vietnam' },
      ],
    };
  }
}

// Get movie by slug
export async function getMovieBySlug(slug: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/phim/${slug}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching movie with slug ${slug}:`, error);
    // Return sample data in case of error
    return {
      status: true,
      item: {
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
      },
    };
  }
}

// Search movies
export async function searchMovies(keyword: string, page = 1, limit = 24): Promise<MovieListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching movies:', error);
    // Return sample data in case of error
    return {
      status: true,
      items: Array(Math.min(limit, 5)).fill(null).map((_, index) => ({
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
      params: {
        pagination: {
          totalItems: 5,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: 1,
        },
      },
    };
  }
}

// Get movies by category
export async function getMoviesByCategory(categorySlug: string, page = 1, limit = 24): Promise<MovieListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/category/${categorySlug}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching movies for category ${categorySlug}:`, error);
    // Return sample data in case of error
    return {
      status: true,
      items: Array(limit).fill(null).map((_, index) => ({
        _id: `category-${index}`,
        name: `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Movie ${index + 1}`,
        origin_name: `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Origin Name ${index + 1}`,
        slug: `${categorySlug}-movie-${index + 1}`,
        type: 'movie',
        thumb_url: 'https://placehold.co/300x450?text=Category',
        poster_url: 'https://placehold.co/900x450?text=Category',
        year: 2023,
        time: '120 min',
        episode_current: '1',
        quality: 'HD',
        lang: 'Vietsub',
        view: 1000 + index * 100,
        status: 'ongoing',
        category: { name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1), slug: categorySlug },
        country: [{ name: 'USA', slug: 'usa' }],
        genres: [{ name: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1), slug: categorySlug }],
        actors: ['Actor 1', 'Actor 2'],
        directors: ['Director'],
        duration: '120 min',
        content: 'Sample movie description',
      })),
      params: {
        pagination: {
          totalItems: 100,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(100 / limit),
        },
      },
    };
  }
}

// Get movies by country
export async function getMoviesByCountry(countrySlug: string, page = 1, limit = 24): Promise<MovieListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/country/${countrySlug}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching movies for country ${countrySlug}:`, error);
    // Return sample data in case of error
    return {
      status: true,
      items: Array(limit).fill(null).map((_, index) => ({
        _id: `country-${index}`,
        name: `${countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1)} Movie ${index + 1}`,
        origin_name: `${countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1)} Origin Name ${index + 1}`,
        slug: `${countrySlug}-movie-${index + 1}`,
        type: 'movie',
        thumb_url: 'https://placehold.co/300x450?text=Country',
        poster_url: 'https://placehold.co/900x450?text=Country',
        year: 2023,
        time: '120 min',
        episode_current: '1',
        quality: 'HD',
        lang: 'Vietsub',
        view: 1000 + index * 100,
        status: 'ongoing',
        category: { name: 'Action', slug: 'action' },
        country: [{ name: countrySlug.charAt(0).toUpperCase() + countrySlug.slice(1), slug: countrySlug }],
        genres: [{ name: 'Action', slug: 'action' }],
        actors: ['Actor 1', 'Actor 2'],
        directors: ['Director'],
        duration: '120 min',
        content: 'Sample movie description',
      })),
      params: {
        pagination: {
          totalItems: 100,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages: Math.ceil(100 / limit),
        },
      },
    };
  }
}
