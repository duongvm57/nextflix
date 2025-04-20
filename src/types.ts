// Common types for the application

// Movie type
export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  type: 'movie' | 'tv_series';
  thumb_url: string;
  poster_url: string;
  year: number;
  time: string;
  episode_current: string;
  quality: string;
  lang: string;
  view?: number;
  status?: string;
  category?: { name: string; slug: string } | null;
  country: { name: string; slug: string }[];
  genres: { name: string; slug: string }[];
  actor: string[];
  director: string[];
  duration: string;
  content: string;
}

// Movie detail type
export interface MovieDetail extends Movie {
  episodes: Episode[];
  trailer_url?: string;
}

// Episode type
export interface Episode {
  server_name: string;
  server_data?: EpisodeItem[];
}

// Episode item type
export interface EpisodeItem {
  name: string;
  slug: string;
  filename?: string;
  link_embed: string;
  link_m3u8: string;
}

// Pagination type
export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
}

// Country type
export interface Country {
  id: string;
  name: string;
  slug: string;
}
