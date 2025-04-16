// API service for phim.nguonc.com
import { Movie, MovieDetail, PaginatedResponse } from '@/types';

const API_BASE_URL = 'https://phim.nguonc.com/api';

// Các endpoint API theo tài liệu
const API_ENDPOINTS = {
  // Danh sách phim
  NEW_MOVIES: '/films/phim-moi-cap-nhat',
  MOVIES_BY_CATEGORY: '/films/danh-sach',

  // Thông tin phim
  MOVIE_DETAIL: '/film',

  // Thể loại, quốc gia, năm
  MOVIES_BY_GENRE: '/films/the-loai',
  MOVIES_BY_COUNTRY: '/films/quoc-gia',
  MOVIES_BY_YEAR: '/films/nam-phat-hanh',

  // Tìm kiếm
  SEARCH: '/films/search',
};

interface APIResponse<T = any> {
  status: 'success' | 'error';
  items: T[];
  paginate: {
    total_items: number;
    items_per_page: number;
    current_page: number;
    total_pages: number;
  };
}

interface MovieAPIResponse {
  status: string;
  paginate: {
    current_page: number;
    total_page: number;
    total_items: number;
    items_per_page: number;
  };
  cat: {
    name: string;
    title: string;
    slug: string;
  };
  items: Array<{
    name: string;
    slug: string;
    original_name: string;
    thumb_url: string;
    poster_url: string;
    description: string;
    [key: string]: any;
  }>;
}

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
  // Trích xuất category chỉ khi có dữ liệu thực sự
  const categoryData = apiMovie.category ? extractCategory(apiMovie.category) : null;

  return {
    _id: apiMovie.id || apiMovie._id || `sample-${Math.random().toString(36).substring(7)}`,
    name: apiMovie.name || 'Unknown Movie',
    origin_name: apiMovie.original_name || '',
    slug: apiMovie.slug || '',
    type: (apiMovie.total_episodes && apiMovie.total_episodes > 1) || apiMovie.type === 'series' ? 'tv_series' : 'movie',
    thumb_url: apiMovie.thumb_url || 'https://placehold.co/300x450?text=Movie',
    poster_url: apiMovie.poster_url || 'https://placehold.co/900x450?text=Movie',
    year: apiMovie.year || new Date().getFullYear(),
    time: apiMovie.time || '',
    episode_current: apiMovie.current_episode || '',
    quality: apiMovie.quality || 'HD',
    lang: apiMovie.language || 'Vietsub',
    view: apiMovie.view || 0,
    category: categoryData,
    country: extractCountry(apiMovie.category),
    genres: extractGenres(apiMovie.category),
    status: 'ongoing',
    actors: apiMovie.casts ? apiMovie.casts.split(', ') : [],
    directors: apiMovie.director ? apiMovie.director.split(', ') : [],
    duration: apiMovie.time || '',
    content: apiMovie.description || '',
  };
}

// Hàm chuyển đổi dữ liệu API sang định dạng MovieDetail
function mapAPIMovieToMovieDetail(apiMovie: any): MovieDetail {
  const movie = mapAPIMovieToMovie(apiMovie);

  return {
    ...movie,
    episodes: apiMovie.episodes || [],
  };
}

// Hàm trích xuất thông tin thể loại từ dữ liệu API
function extractCategory(category: any): { name: string; slug: string } {
  if (!category) return { name: 'Phim lẻ', slug: 'phim-le' };

  try {
    // Tìm nhóm "Định dạng"
    const formatGroup = category['1'];
    if (formatGroup && formatGroup.list && formatGroup.list.length > 0) {
      return {
        name: formatGroup.list[0].name,
        slug: formatGroup.list[0].name.toLowerCase().replace(/\s+/g, '-'),
      };
    }
  } catch (error) {
    console.error('Error extracting category:', error);
  }

  return { name: 'Phim lẻ', slug: 'phim-le' };
}

// Hàm trích xuất thông tin quốc gia từ dữ liệu API
function extractCountry(category: any): { name: string; slug: string }[] {
  if (!category) return [{ name: 'Quốc gia khác', slug: 'quoc-gia-khac' }];

  try {
    // Tìm nhóm "Quốc gia"
    const countryGroup = category['4'];
    if (countryGroup && countryGroup.list && countryGroup.list.length > 0) {
      return countryGroup.list.map((country: any) => ({
        name: country.name,
        slug: country.name.toLowerCase().replace(/\s+/g, '-'),
      }));
    }
  } catch (error) {
    console.error('Error extracting country:', error);
  }

  return [{ name: 'Quốc gia khác', slug: 'quoc-gia-khac' }];
}

// Hàm trích xuất thông tin thể loại từ dữ liệu API
function extractGenres(category: any): { name: string; slug: string }[] {
  if (!category) return [{ name: 'Hành Động', slug: 'hanh-dong' }];

  try {
    // Tìm nhóm "Thể loại"
    const genreGroup = category['2'];
    if (genreGroup && genreGroup.list && genreGroup.list.length > 0) {
      return genreGroup.list.map((genre: any) => ({
        name: genre.name,
        slug: genre.name.toLowerCase().replace(/\s+/g, '-'),
      }));
    }
  } catch (error) {
    console.error('Error extracting genres:', error);
  }

  return [{ name: 'Hành Động', slug: 'hanh-dong' }];
}

// Get list of new movies with pagination
export async function getNewMovies(page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.NEW_MOVIES}`, { page: page.toString() });

    if (response && response.status === 'success') {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        return {
          data: response.items.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: response.paginate.total_items || 0,
            totalItemsPerPage: response.paginate.items_per_page || 10,
            currentPage: response.paginate.current_page || page,
            totalPages: response.paginate.total_page || 1,
          },
        };
      } else {
        // Return empty data with pagination
        console.log('API returned empty items array');
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalItemsPerPage: 10,
            currentPage: page,
            totalPages: 1,
          },
        };
      }
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
export async function getMovieBySlug(slug: string): Promise<MovieDetail> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIE_DETAIL}/${slug}`);

    if (response && response.status === 'success' && response.movie) {
      return mapAPIMovieToMovieDetail(response.movie);
    }

    throw new Error('Empty response from API');
  } catch (error) {
    console.error(`Error fetching movie with slug ${slug}:`, error);
    // Return sample data in case of error
    return getSampleMovieDetail(slug);
  }
}

// Get movies by category
export async function getMoviesByCategory(categorySlug: string, page = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetchAPI(`${API_ENDPOINTS.MOVIES_BY_CATEGORY}/${categorySlug}`, { page: page.toString() });

    if (response && response.status === 'success') {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        return {
          data: response.items.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: response.paginate.total_items || 0,
            totalItemsPerPage: response.paginate.items_per_page || 10,
            currentPage: response.paginate.current_page || page,
            totalPages: response.paginate.total_page || 1,
          },
        };
      } else {
        // Return empty data with pagination
        console.log(`API returned empty items array for category ${categorySlug}`);
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalItemsPerPage: 10,
            currentPage: page,
            totalPages: 1,
          },
        };
      }
    }

    console.log(`API response not successful for category ${categorySlug}, using sample data`);
    return getSampleMovieData(page, `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Movie`);
  } catch (error) {
    console.error(`Error fetching movies for category ${categorySlug}:`, error);
    // Return sample data in case of error
    return getSampleMovieData(page, `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Movie`);
  }
}

// Get movies by genre
export async function getMoviesByGenre(slug: string, page: number = 1): Promise<PaginatedResponse<Movie>> {
  try {
    const response = await fetch(`${API_BASE_URL}/films/the-loai/${slug}?page=${page}`);
    const data = await response.json() as MovieAPIResponse;

    if (data?.status === 'success' && Array.isArray(data.items)) {
      const movies = data.items.map(item => ({
        _id: item.slug,
        name: item.name,
        origin_name: item.original_name,
        slug: item.slug,
        type: 'movie',
        thumb_url: item.thumb_url,
        poster_url: item.poster_url,
        year: new Date().getFullYear(),
        time: '',
        episode_current: '',
        quality: 'HD',
        lang: 'Vietsub',
        view: 0,
        category: {
          name: data.cat.name,
          slug: data.cat.slug
        },
        country: [],
        genres: [{
          name: data.cat.name,
          slug: data.cat.slug
        }],
        actors: [],
        directors: [],
        duration: '',
        content: item.description || ''
      }));

      return {
        data: movies,
        pagination: {
          totalItems: data.paginate.total_items,
          totalItemsPerPage: data.paginate.items_per_page,
          currentPage: data.paginate.current_page,
          totalPages: data.paginate.total_page
        }
      };
    }

    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: 0
      }
    };
  } catch (error) {
    console.error(`Error fetching movies by genre ${slug}:`, error);
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: 0
      }
    };
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

    if (response && response.status === 'success') {
      // Check if there are items
      if (response.items && response.items.length > 0) {
        return {
          data: response.items.map(mapAPIMovieToMovie),
          pagination: {
            totalItems: response.paginate.total_items || 0,
            totalItemsPerPage: response.paginate.items_per_page || 10,
            currentPage: response.paginate.current_page || page,
            totalPages: response.paginate.total_page || 1,
          },
        };
      } else {
        // Return empty data with pagination
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalItemsPerPage: 10,
            currentPage: page,
            totalPages: 1,
          },
        };
      }
    }

    // If response is not successful, return empty data
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: 1,
      },
    };
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
        server_name: 'Server 1',
        items: [
          {
            name: 'Full',
            slug: 'full',
            embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            m3u8: '',
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

// Get categories list
export async function getCategories(locale = 'vi') {
  // Return sample data based on locale
  return locale === 'en' ? getEnglishCategories() : getSampleCategories();
}

// Get countries list
export async function getCountries(locale = 'vi') {
  // Return sample data based on locale
  return locale === 'en' ? getEnglishCountries() : getSampleCountries();
}

// Helper function to generate sample categories
function getSampleCategories() {
  return [
    { id: 'cat-1', name: 'TV shows', slug: 'tv-shows', description: 'TV Shows' },
    { id: 'cat-2', name: 'Phim lẻ', slug: 'phim-le', description: 'Phim lẻ' },
    { id: 'cat-3', name: 'Phim bộ', slug: 'phim-bo', description: 'Phim bộ' },
    { id: 'cat-4', name: 'Phim đang chiếu', slug: 'phim-dang-chieu', description: 'Phim đang chiếu' },
  ];
}

// Helper function to get genres
export async function getGenres(locale = 'vi') {
  return locale === 'en' ? getEnglishGenres() : getVietnameseGenres();
}

// Helper function to generate Vietnamese genres
function getVietnameseGenres() {
  return [
    { id: 'genre-1', name: 'Hành Động', slug: 'hanh-dong', description: 'Phim Hành Động' },
    { id: 'genre-2', name: 'Phiêu Lưu', slug: 'phieu-luu', description: 'Phim Phiêu Lưu' },
    { id: 'genre-3', name: 'Hoạt Hình', slug: 'hoat-hinh', description: 'Phim Hoạt Hình' },
    { id: 'genre-4', name: 'Hài', slug: 'phim-hai', description: 'Phim Hài' },
    { id: 'genre-5', name: 'Hình Sự', slug: 'hinh-su', description: 'Phim Hình Sự' },
    { id: 'genre-6', name: 'Tài Liệu', slug: 'tai-lieu', description: 'Phim Tài Liệu' },
    { id: 'genre-7', name: 'Chính Kịch', slug: 'chinh-kich', description: 'Phim Chính Kịch' },
    { id: 'genre-8', name: 'Gia Đình', slug: 'gia-dinh', description: 'Phim Gia Đình' },
    { id: 'genre-9', name: 'Giả Tưởng', slug: 'gia-tuong', description: 'Phim Giả Tưởng' },
    { id: 'genre-10', name: 'Lịch Sử', slug: 'lich-su', description: 'Phim Lịch Sử' },
    { id: 'genre-11', name: 'Kinh Dị', slug: 'kinh-di', description: 'Phim Kinh Dị' },
    { id: 'genre-12', name: 'Nhạc', slug: 'nhac', description: 'Phim Nhạc' },
    { id: 'genre-13', name: 'Bí Ẩn', slug: 'bi-an', description: 'Phim Bí Ẩn' },
    { id: 'genre-14', name: 'Lãng Mạn', slug: 'lang-man', description: 'Phim Lãng Mạn' },
    { id: 'genre-15', name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong', description: 'Phim Khoa Học Viễn Tưởng' },
    { id: 'genre-16', name: 'Tâm Lý', slug: 'tam-ly', description: 'Phim Tâm Lý' },
    { id: 'genre-17', name: 'Tình Cảm', slug: 'tinh-cam', description: 'Phim Tình Cảm' },
    { id: 'genre-18', name: 'Cổ Trang', slug: 'co-trang', description: 'Phim Cổ Trang' },
    { id: 'genre-19', name: 'Miền Tây', slug: 'mien-tay', description: 'Phim Miền Tây' },
    { id: 'genre-20', name: 'Phim 18+', slug: 'phim-18-plus', description: 'Phim 18+' },
  ];
}

// Helper function to generate English genres
function getEnglishGenres() {
  return [
    { id: 'genre-1', name: 'Action', slug: 'hanh-dong', description: 'Action Movies' },
    { id: 'genre-2', name: 'Adventure', slug: 'phieu-luu', description: 'Adventure Movies' },
    { id: 'genre-3', name: 'Animation', slug: 'hoat-hinh', description: 'Animation Movies' },
    { id: 'genre-4', name: 'Comedy', slug: 'hai', description: 'Comedy Movies' },
    { id: 'genre-5', name: 'Crime', slug: 'hinh-su', description: 'Crime Movies' },
    { id: 'genre-6', name: 'Documentary', slug: 'tai-lieu', description: 'Documentary Movies' },
    { id: 'genre-7', name: 'Drama', slug: 'chinh-kich', description: 'Drama Movies' },
    { id: 'genre-8', name: 'Family', slug: 'gia-dinh', description: 'Family Movies' },
    { id: 'genre-9', name: 'Fantasy', slug: 'gia-tuong', description: 'Fantasy Movies' },
    { id: 'genre-10', name: 'History', slug: 'lich-su', description: 'History Movies' },
    { id: 'genre-11', name: 'Horror', slug: 'kinh-di', description: 'Horror Movies' },
    { id: 'genre-12', name: 'Music', slug: 'nhac', description: 'Music Movies' },
    { id: 'genre-13', name: 'Mystery', slug: 'bi-an', description: 'Mystery Movies' },
    { id: 'genre-14', name: 'Romance', slug: 'lang-man', description: 'Romance Movies' },
    { id: 'genre-15', name: 'Science Fiction', slug: 'khoa-hoc-vien-tuong', description: 'Science Fiction Movies' },
    { id: 'genre-16', name: 'Psychological', slug: 'tam-ly', description: 'Psychological Movies' },
    { id: 'genre-17', name: 'Emotional', slug: 'tinh-cam', description: 'Emotional Movies' },
    { id: 'genre-18', name: 'Historical', slug: 'co-trang', description: 'Historical Movies' },
    { id: 'genre-19', name: 'Western', slug: 'mien-tay', description: 'Western Movies' },
    { id: 'genre-20', name: 'Adult 18+', slug: 'phim-18-plus', description: 'Adult 18+ Movies' },
  ];
}

// Helper function to get categories in English
function getEnglishCategories() {
  return [
    { id: 'cat-1', name: 'TV shows', slug: 'tv-shows', description: 'TV Shows' },
    { id: 'cat-2', name: 'Movies', slug: 'phim-le', description: 'Movies' },
    { id: 'cat-3', name: 'TV Series', slug: 'phim-bo', description: 'TV Series' },
    { id: 'cat-4', name: 'Now Showing', slug: 'phim-dang-chieu', description: 'Now Showing' },
  ];
}

// Helper function to generate sample countries
function getSampleCountries() {
  return [
    { id: 'country-1', name: 'Âu Mỹ', slug: 'au-my', description: 'Phim Âu Mỹ' },
    { id: 'country-2', name: 'Anh', slug: 'anh', description: 'Phim Anh' },
    { id: 'country-3', name: 'Trung Quốc', slug: 'trung-quoc', description: 'Phim Trung Quốc' },
    { id: 'country-4', name: 'Indonesia', slug: 'indonesia', description: 'Phim Indonesia' },
    { id: 'country-5', name: 'Việt Nam', slug: 'viet-nam', description: 'Phim Việt Nam' },
    { id: 'country-6', name: 'Pháp', slug: 'phap', description: 'Phim Pháp' },
    { id: 'country-7', name: 'Hồng Kông', slug: 'hong-kong', description: 'Phim Hồng Kông' },
    { id: 'country-8', name: 'Hàn Quốc', slug: 'han-quoc', description: 'Phim Hàn Quốc' },
    { id: 'country-9', name: 'Nhật Bản', slug: 'nhat-ban', description: 'Phim Nhật Bản' },
    { id: 'country-10', name: 'Thái Lan', slug: 'thai-lan', description: 'Phim Thái Lan' },
    { id: 'country-11', name: 'Đài Loan', slug: 'dai-loan', description: 'Phim Đài Loan' },
    { id: 'country-12', name: 'Nga', slug: 'nga', description: 'Phim Nga' },
    { id: 'country-13', name: 'Hà Lan', slug: 'ha-lan', description: 'Phim Hà Lan' },
    { id: 'country-14', name: 'Philippines', slug: 'philippines', description: 'Phim Philippines' },
    { id: 'country-15', name: 'Ấn Độ', slug: 'an-do', description: 'Phim Ấn Độ' },
    { id: 'country-16', name: 'Quốc gia khác', slug: 'quoc-gia-khac', description: 'Phim Quốc gia khác' },
  ];
}

// Helper function to get countries in English
function getEnglishCountries() {
  return [
    { id: 'country-1', name: 'USA', slug: 'au-my', description: 'American Movies' },
    { id: 'country-2', name: 'UK', slug: 'anh', description: 'British Movies' },
    { id: 'country-3', name: 'China', slug: 'trung-quoc', description: 'Chinese Movies' },
    { id: 'country-4', name: 'Indonesia', slug: 'indonesia', description: 'Indonesian Movies' },
    { id: 'country-5', name: 'Vietnam', slug: 'viet-nam', description: 'Vietnamese Movies' },
    { id: 'country-6', name: 'France', slug: 'phap', description: 'French Movies' },
    { id: 'country-7', name: 'Hong Kong', slug: 'hong-kong', description: 'Hong Kong Movies' },
    { id: 'country-8', name: 'Korea', slug: 'han-quoc', description: 'Korean Movies' },
    { id: 'country-9', name: 'Japan', slug: 'nhat-ban', description: 'Japanese Movies' },
    { id: 'country-10', name: 'Thailand', slug: 'thai-lan', description: 'Thai Movies' },
    { id: 'country-11', name: 'Taiwan', slug: 'dai-loan', description: 'Taiwan Movies' },
    { id: 'country-12', name: 'Russia', slug: 'nga', description: 'Russian Movies' },
    { id: 'country-13', name: 'Netherlands', slug: 'ha-lan', description: 'Dutch Movies' },
    { id: 'country-14', name: 'Philippines', slug: 'philippines', description: 'Filipino Movies' },
    { id: 'country-15', name: 'India', slug: 'an-do', description: 'Indian Movies' },
    { id: 'country-16', name: 'Other Countries', slug: 'quoc-gia-khac', description: 'Movies from other countries' },
  ];
}

// Alias functions for compatibility with existing code
export const getMovies = getNewMovies;
export const getTVShows = (page = 1) => getMoviesByCategory('phim-bo', page);
