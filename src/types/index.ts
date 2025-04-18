export interface Movie {
  _id: string;
  name: string;
  origin_name: string;
  slug: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  category: {
    name: string;
    slug: string;
  };
  country: {
    name: string;
    slug: string;
  }[];
  type: string;
  status: string;
  episode_current: string;
  quality: string;
  lang: string;
  view: number;
  genres: {
    name: string;
    slug: string;
  }[];
  actors: string[];
  directors: string[];
  duration: string;
  content: string;
  trailer_url?: string;
  time?: string;
  episodes?: Episode[];
}

export interface EpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface Episode {
  server_name: string;
  items: EpisodeItem[];
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

export interface MovieDetail extends Movie {
  episodes: Episode[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Genre {
  name: string;
  slug: string;
}
