/**
 * Client-side cache utility for API responses
 * This helps reduce API calls by storing responses in localStorage
 */

// Default cache expiration time (1 hour in milliseconds)
const DEFAULT_CACHE_TIME = 60 * 60 * 1000;

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

/**
 * Client-side cache utility
 */
export const clientCache = {
  /**
   * Get item from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    try {
      // Skip cache in server-side rendering
      if (typeof window === 'undefined') return null;

      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.expiry) {
        console.log(`Cache expired for ${key}`);
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      console.log(`Cache hit for ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  },

  /**
   * Set item in cache
   * @param key Cache key
   * @param data Data to cache
   * @param expiry Cache expiration time in milliseconds (default: 1 hour)
   */
  set<T>(key: string, data: T, expiry: number = DEFAULT_CACHE_TIME): void {
    try {
      // Skip cache in server-side rendering
      if (typeof window === 'undefined') return;

      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry,
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      console.log(`Cache set for ${key}, expires in ${expiry/1000} seconds`);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  /**
   * Remove item from cache
   * @param key Cache key
   */
  remove(key: string): void {
    try {
      // Skip cache in server-side rendering
      if (typeof window === 'undefined') return;

      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  },

  /**
   * Clear all cache items
   */
  clear(): void {
    try {
      // Skip cache in server-side rendering
      if (typeof window === 'undefined') return;

      // Only clear items with our cache prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};

/**
 * Memoize a function with caching
 * @param fn Function to memoize
 * @param keyFn Function to generate cache key from arguments
 * @param expiry Cache expiration time in milliseconds
 * @returns Memoized function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args),
  expiry: number = DEFAULT_CACHE_TIME
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const cached = clientCache.get<T>(key);

    if (cached !== null) {
      console.log(`Using memoized result for ${key}`);
      return cached;
    }

    console.log(`Fetching fresh data for ${key}`);
    const result = await fn(...args);

    if (result) {
      clientCache.set(key, result, expiry);
    }

    return result;
  };
}
