// src/lib/config/cache-config.ts
export const CACHE_CONFIG = {
  SERVER: {
    CATEGORIES: 7200, // 2 hours
    COUNTRIES: 7200, // 2 hours
    MOVIES: 1800, // 30 minutes
    BATCH: 3600, // 1 hour
    MENU: 7200, // 2 hours
    RSC_REQUESTS: 86400, // 24 hours
  },
  CLIENT: {
    CATEGORIES: 7200000, // 2 hours
    COUNTRIES: 7200000, // 2 hours
    MOVIES: 1800000, // 30 minutes
    MENU: 7200000, // 2 hours
    BATCH: 3600000, // 1 hour
    NAVIGATION: 3600000, // 1 hour - cache for navigation data
    RSC_REQUESTS: 86400000, // 24 hours
    VISITED_PATHS: 86400000, // 24 hours
    PREFETCHED_LINKS: 3600000, // 1 hour
  },
  HTTP: {
    STATIC: 31536000, // 1 year
    DYNAMIC: 300, // 5 minutes
    API: 600, // 10 minutes
    BATCH: 1800, // 30 minutes
    RSC: 3600, // 1 hour
  },
};

// Cache keys
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  COUNTRIES: 'countries',
  MENU: 'menu',
  MOVIES: 'movies',
  BATCH: 'batch',
  NAVIGATION: 'navigation',
  RSC_REQUESTS: 'rsc_requests',
  VISITED_PATHS: 'visited_paths',
  PREFETCHED_LINKS: 'prefetched_links',
};
