// src/lib/config/cache-config.ts
export const CACHE_CONFIG = {
  SERVER: {
    CATEGORIES: 86400, // 24 hours
    COUNTRIES: 86400, // 24 hours
    MOVIES: 3600, // 1 hour
    BATCH: 7200, // 2 hours
    MENU: 86400, // 24 hours
    RSC_REQUESTS: 86400, // 24 hours
  },
  CLIENT: {
    CATEGORIES: 86400000, // 24 hours
    COUNTRIES: 86400000, // 24 hours
    MOVIES: 3600000, // 1 hour
    MENU: 86400000, // 24 hours
    BATCH: 7200000, // 2 hours
    NAVIGATION: 7200000, // 2 hours - cache for navigation data
    RSC_REQUESTS: 86400000, // 24 hours
    VISITED_PATHS: 86400000, // 24 hours
    PREFETCHED_LINKS: 7200000, // 2 hours
  },
  HTTP: {
    STATIC: 31536000, // 1 year
    DYNAMIC: 600, // 10 minutes
    API: 1800, // 30 minutes
    BATCH: 3600, // 1 hour
    RSC: 7200, // 2 hours
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
