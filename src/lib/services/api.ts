import { Movie, MovieDetail, PaginatedResponse } from '@/types';
import { logger } from '@/utils/logger';
import {
  getMovies,
  getMoviesByGenre,
  getMoviesByCountry,
  getMoviesByYear,
  searchMovies,
  getMovieBySlug,
} from '@/services/phimapi';

// API functions using real API
export const movieService = {
  // Get newly updated movies
  getNewMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug('Fetching new movies from API');
    try {
      return await getMovies(page);
    } catch (error) {
      logger.error('Error fetching new movies:', error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },

  // Get movies by category
  getMoviesByCategory: async (
    slug: string,
    page: number = 1
  ): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Fetching movies for category: ${slug}`);
    try {
      return await getMoviesByGenre(slug, page);
    } catch (error) {
      logger.error(`Error fetching movies for category ${slug}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },

  // Get movie details
  getMovieDetail: async (slug: string): Promise<MovieDetail> => {
    logger.debug(`Fetching movie detail for: ${slug}`);
    try {
      const movie = await getMovieBySlug(slug);
      if (!movie) {
        throw new Error('Movie not found');
      }
      return movie;
    } catch (error) {
      logger.error(`Error fetching movie detail for ${slug}:`, error);
      throw new Error('Movie not found');
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Fetching movies for genre: ${slug}`);
    try {
      return await getMoviesByGenre(slug, page);
    } catch (error) {
      logger.error(`Error fetching movies for genre ${slug}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },

  // Get movies by country
  getMoviesByCountry: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Fetching movies for country: ${slug}`);
    try {
      return await getMoviesByCountry(slug, page);
    } catch (error) {
      logger.error(`Error fetching movies for country ${slug}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },

  // Get movies by year
  getMoviesByYear: async (year: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Fetching movies for year: ${year}`);
    try {
      return await getMoviesByYear(year, page);
    } catch (error) {
      logger.error(`Error fetching movies for year ${year}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },

  // Search movies
  searchMovies: async (keyword: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Searching movies for: ${keyword}`);
    try {
      return await searchMovies(keyword, page);
    } catch (error) {
      logger.error(`Error searching movies for ${keyword}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    }
  },
};
