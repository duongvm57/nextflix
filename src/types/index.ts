// Common types used across the application

// Re-export types from other files
export * from './api';
export * from './config';
export * from './ui';

/**
 * Represents a named entity with a slug for routing
 */
export interface INamedEntity {
  name: string;
  slug: string;
}

/**
 * Represents a category with optional description
 */
export interface ICategory extends INamedEntity {
  id: string;
  description?: string;
}

/**
 * Represents a country with optional description
 */
export interface ICountry extends INamedEntity {
  id: string;
  description?: string;
}

/**
 * Represents a genre
 */
export interface IGenre extends INamedEntity {
  // Additional properties can be added here in the future
  id?: string;
}

/**
 * Represents a movie
 */
export interface IMovie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  category: INamedEntity | null;
  country: INamedEntity[];
  type: 'movie' | 'tv_series' | string;
  status: 'ongoing' | 'completed' | string;
  episode_current: string;
  quality: 'HD' | 'SD' | 'CAM' | string;
  lang: string;
  view: number;
  genres: INamedEntity[];
  actors: string[];
  directors: string[];
  duration: string;
  content: string;
  trailer_url?: string;
  time?: string;
  episodes?: IEpisode[];
}

/**
 * Represents a single episode item with playback links
 */
export interface IEpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

/**
 * Represents a server with multiple episode items
 */
export interface IEpisode {
  server_name: string;
  items: IEpisodeItem[];
}

/**
 * Represents pagination information for API responses
 */
export interface IPagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Generic paginated response type
 */
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

/**
 * Represents detailed movie information including episodes
 */
export interface IMovieDetail extends IMovie {
  episodes: IEpisode[];
}

/**
 * API response types
 */
export interface IApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}

/**
 * For backward compatibility with existing code
 */
export interface Movie {
  id: string;
  name: string;
  originalName: string;
  slug: string;
  year: string;
  thumbnail: string;
  // Thêm các field khác nếu cần
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

export type MovieDetail = IMovieDetail;
export type Episode = IEpisode;
export type EpisodeItem = IEpisodeItem;
export type Category = ICategory;
export type Country = ICountry;
export type Genre = IGenre;
