import axios from 'axios';
import { Movie, MovieDetail, PaginatedResponse, Episode } from '@/types';
import { getSampleMovies, sampleMovies } from '@/lib/data/sample-movies';

const API_BASE_URL = 'https://phim.nguonc.com/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const movieService = {
  // Get newly updated movies
  getNewMovies: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/phim-moi-cap-nhat?page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
        console.log('API returned empty data, using sample data instead');
        return getSampleMovies(page);
      }
    } catch (error) {
      console.error('Error fetching new movies from API, using sample data instead:', error);
      return getSampleMovies(page);
    }
  },

  // Get movies by category
  getMoviesByCategory: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/danh-sach/${slug}?page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
        // Filter sample movies by category
        const filteredMovies = sampleMovies.filter(movie => movie.category.slug === slug);
        return {
          data: filteredMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalItemsPerPage: 10,
            currentPage: page,
            totalPages: Math.ceil(filteredMovies.length / 10)
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching movies by category ${slug}, using sample data:`, error);
      // Filter sample movies by category
      const filteredMovies = sampleMovies.filter(movie => movie.category.slug === slug);
      return {
        data: filteredMovies,
        pagination: {
          totalItems: filteredMovies.length,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: Math.ceil(filteredMovies.length / 10)
        }
      };
    }
  },

  // Get movie details
  getMovieDetail: async (slug: string): Promise<MovieDetail> => {
    try {
      const response = await apiClient.get(`/film/${slug}`);
      if (response.data && response.data.status === 'success' && response.data.movie) {
        // Transform API response to match our MovieDetail type
        const apiMovie = response.data.movie;

        // Extract episodes from API response
        const episodes: Episode[] = [];
        if (apiMovie.episodes && apiMovie.episodes.length > 0) {
          apiMovie.episodes.forEach((server: any) => {
            if (server.items && server.items.length > 0) {
              server.items.forEach((item: any) => {
                episodes.push({
                  _id: `${apiMovie.id}-${item.slug}`,
                  name: item.name,
                  slug: item.slug,
                  filename: item.slug,
                  link_embed: item.embed,
                  link_m3u8: item.m3u8
                });
              });
            }
          });
        }

        // Extract genres from API response
        const genres: {name: string; slug: string}[] = [];
        if (apiMovie.category && apiMovie.category['2'] &&
            apiMovie.category['2'].list && apiMovie.category['2'].list.length > 0) {
          apiMovie.category['2'].list.forEach((genre: any) => {
            genres.push({
              name: genre.name,
              slug: genre.id.toLowerCase()
            });
          });
        }

        // Extract country from API response
        const country: {name: string; slug: string}[] = [];
        if (apiMovie.category && apiMovie.category['4'] &&
            apiMovie.category['4'].list && apiMovie.category['4'].list.length > 0) {
          apiMovie.category['4'].list.forEach((c: any) => {
            country.push({
              name: c.name,
              slug: c.id.toLowerCase()
            });
          });
        }

        // Create category object
        let category = {
          name: 'Movies',
          slug: 'phim-le'
        };

        if (apiMovie.category && apiMovie.category['1'] &&
            apiMovie.category['1'].list && apiMovie.category['1'].list.length > 0) {
          const categoryName = apiMovie.category['1'].list[0].name;
          if (categoryName === 'Phim bộ') {
            category = {
              name: 'TV Series',
              slug: 'phim-bo'
            };
          } else if (categoryName === 'Hoạt Hình') {
            category = {
              name: 'Anime',
              slug: 'hoat-hinh'
            };
          }
        }

        // Create movie object that matches our MovieDetail type
        const movie: MovieDetail = {
          _id: apiMovie.id,
          name: apiMovie.name,
          origin_name: apiMovie.original_name,
          slug: apiMovie.slug,
          thumb_url: apiMovie.thumb_url,
          poster_url: apiMovie.poster_url,
          year: parseInt(apiMovie.category['3']?.list[0]?.name || '2024'),
          category: category,
          country: country,
          type: category.slug === 'phim-bo' ? 'series' : 'movie',
          status: 'completed',
          episode_current: apiMovie.current_episode,
          quality: 'HD',
          lang: apiMovie.language,
          view: 10000, // Default view count
          genres: genres,
          actors: apiMovie.casts ? apiMovie.casts.split(', ') : [],
          directors: apiMovie.director ? apiMovie.director.split(', ') : [],
          duration: apiMovie.time,
          content: apiMovie.description,
          episodes: episodes
        };

        return movie;
      } else {
        // Find movie in sample data
        const movie = sampleMovies.find(m => m.slug === slug);
        if (movie) {
          return { ...movie } as MovieDetail;
        } else {
          throw new Error('Movie not found');
        }
      }
    } catch (error) {
      console.error(`Error fetching movie details for ${slug}, using sample data:`, error);
      // Find movie in sample data
      const movie = sampleMovies.find(m => m.slug === slug);
      if (movie) {
        return { ...movie } as MovieDetail;
      } else {
        throw new Error('Movie not found');
      }
    }
  },

  // Get movies by genre
  getMoviesByGenre: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/the-loai/${slug}?page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
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
            totalPages: Math.ceil(filteredMovies.length / 10)
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching movies by genre ${slug}, using sample data:`, error);
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
          totalPages: Math.ceil(filteredMovies.length / 10)
        }
      };
    }
  },

  // Get movies by country
  getMoviesByCountry: async (slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/quoc-gia/${slug}?page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
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
            totalPages: Math.ceil(filteredMovies.length / 10)
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching movies by country ${slug}, using sample data:`, error);
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
          totalPages: Math.ceil(filteredMovies.length / 10)
        }
      };
    }
  },

  // Get movies by year
  getMoviesByYear: async (year: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/nam-phat-hanh/${year}?page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
        // Filter sample movies by year
        const filteredMovies = sampleMovies.filter(movie => movie.year.toString() === year);
        return {
          data: filteredMovies,
          pagination: {
            totalItems: filteredMovies.length,
            totalItemsPerPage: 10,
            currentPage: page,
            totalPages: Math.ceil(filteredMovies.length / 10)
          }
        };
      }
    } catch (error) {
      console.error(`Error fetching movies by year ${year}, using sample data:`, error);
      // Filter sample movies by year
      const filteredMovies = sampleMovies.filter(movie => movie.year.toString() === year);
      return {
        data: filteredMovies,
        pagination: {
          totalItems: filteredMovies.length,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: Math.ceil(filteredMovies.length / 10)
        }
      };
    }
  },

  // Search movies
  searchMovies: async (keyword: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
    try {
      const response = await apiClient.get(`/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`);
      if (response.data && response.data.status === 'success' && response.data.items && response.data.items.length > 0) {
        return {
          data: response.data.items,
          pagination: {
            totalItems: response.data.paginate.total_items || 0,
            totalItemsPerPage: response.data.paginate.items_per_page || 10,
            currentPage: response.data.paginate.current_page || page,
            totalPages: response.data.paginate.total_page || 1,
          }
        };
      } else {
        // Search in sample movies
        const searchTerm = keyword.toLowerCase();
        const filteredMovies = sampleMovies.filter(movie =>
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
            totalPages: Math.ceil(filteredMovies.length / 10)
          }
        };
      }
    } catch (error) {
      console.error(`Error searching movies for ${keyword}, using sample data:`, error);
      // Search in sample movies
      const searchTerm = keyword.toLowerCase();
      const filteredMovies = sampleMovies.filter(movie =>
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
          totalPages: Math.ceil(filteredMovies.length / 10)
        }
      };
    }
  },
};
