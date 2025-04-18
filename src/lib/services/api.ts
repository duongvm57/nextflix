import { Movie, MovieDetail, PaginatedResponse } from '@/types';
import { getSampleMovies, sampleMovies } from '@/lib/data/sample-movies';
import { logger } from '@/utils/logger';

// API functions using only sample data
export const movieService = {
  // Get newly updated movies
  getNewMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug('Using sample data for new movies');
    return getSampleMovies(page);
  },

  // Get movies by category
  getMoviesByCategory: async (
    slug: string,
    page: number = 1
  ): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Using sample data for category: ${slug}`);
    // Filter sample movies by category
    const filteredMovies = sampleMovies.filter(movie => movie?.category?.slug === slug);
    return {
      data: filteredMovies,
      pagination: {
        totalItems: filteredMovies.length,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: Math.ceil(filteredMovies.length / 10),
      },
    };
  },

  // Get movie details
  getMovieDetail: async (slug: string): Promise<MovieDetail> => {
    logger.debug(`Using sample data for movie detail: ${slug}`);
    // Find movie in sample data
    const movie = sampleMovies.find(m => m.slug === slug);
    if (movie) {
      return { ...movie } as MovieDetail;
    } else {
      throw new Error('Movie not found');
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Using sample data for genre: ${slug}`);
    // Filter sample movies by genre
    const filteredMovies = sampleMovies.filter(movie =>
      movie.genres.some(genre => genre.slug === slug)
    );
    return {
      data: filteredMovies,
      pagination: {
        totalItems: filteredMovies.length,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: Math.ceil(filteredMovies.length / 10),
      },
    };
  },

  // Get movies by country
  getMoviesByCountry: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Using sample data for country: ${slug}`);
    // Filter sample movies by country
    const filteredMovies = sampleMovies.filter(movie =>
      movie.country.some(country => country.slug === slug)
    );
    return {
      data: filteredMovies,
      pagination: {
        totalItems: filteredMovies.length,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: Math.ceil(filteredMovies.length / 10),
      },
    };
  },

  // Get movies by year
  getMoviesByYear: async (year: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Using sample data for year: ${year}`);
    // Filter sample movies by year
    const filteredMovies = sampleMovies.filter(movie => movie.year.toString() === year);
    return {
      data: filteredMovies,
      pagination: {
        totalItems: filteredMovies.length,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: Math.ceil(filteredMovies.length / 10),
      },
    };
  },

  // Search movies
  searchMovies: async (keyword: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    logger.debug(`Using sample data for search: ${keyword}`);
    // Search in sample movies
    const searchTerm = keyword.toLowerCase();
    const filteredMovies = sampleMovies.filter(
      movie =>
        movie.name.toLowerCase().includes(searchTerm) ||
        movie.origin_name.toLowerCase().includes(searchTerm) ||
        movie.content.toLowerCase().includes(searchTerm) ||
        movie.actors.some(actor => actor.toLowerCase().includes(searchTerm)) ||
        movie.directors.some(director => director.toLowerCase().includes(searchTerm))
    );
    return {
      data: filteredMovies,
      pagination: {
        totalItems: filteredMovies.length,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: Math.ceil(filteredMovies.length / 10),
      },
    };
  },
};
