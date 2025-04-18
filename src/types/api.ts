import type { IMovie, IPaginatedResponse, IMovieDetail } from './index';

/**
 * PhimAPI response structure
 */
export interface IPhimApiResponse<T> {
  status: boolean | 'success' | 'error';
  message?: string;
  items?: T[];
  movie?: IMovie;
  episodes?: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename?: string;
      link_embed?: string;
      link_m3u8?: string;
    }>;
  }>;
  pagination?: {
    totalItems: number;
    totalItemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}

/**
 * PhimAPI V1 response structure
 */
export interface IPhimApiV1Response<T> {
  status: 'success' | 'error';
  message?: string;
  data: {
    items: T[];
    params: {
      pagination: {
        totalItems: number;
        totalItemsPerPage: number;
        currentPage: number;
        totalPages: number;
      };
    };
    APP_DOMAIN_CDN_IMAGE: string;
  };
}

/**
 * API endpoints configuration
 */
export interface IApiEndpoints {
  NEW_MOVIES: string;
  MOVIE_DETAIL: string;
  V1_MOVIES_LIST: string;
  V1_SEARCH: string;
  V1_CATEGORY: string;
  V1_COUNTRY: string;
  V1_YEAR: string;
  CATEGORIES_LIST: string;
  COUNTRIES_LIST: string;
}

/**
 * API service function types
 */
export type GetMoviesFunction = (
  page?: number,
  limit?: number
) => Promise<IPaginatedResponse<IMovie>>;
export type GetMovieDetailFunction = (slug: string) => Promise<IMovieDetail | null>;
export type GetMoviesByCategoryFunction = (
  categorySlug: string,
  page?: number,
  options?: Record<string, string | number | boolean | undefined>
) => Promise<IPaginatedResponse<IMovie>>;
export type GetMoviesByCountryFunction = (
  countrySlug: string,
  page?: number,
  options?: Record<string, string | number | boolean | undefined>
) => Promise<IPaginatedResponse<IMovie>>;
export type GetMoviesByYearFunction = (
  year: string,
  page?: number,
  options?: Record<string, string | number | boolean | undefined>
) => Promise<IPaginatedResponse<IMovie>>;
export type SearchMoviesFunction = (
  keyword: string,
  page?: number,
  options?: Record<string, string | number | boolean | undefined>
) => Promise<IPaginatedResponse<IMovie>>;
