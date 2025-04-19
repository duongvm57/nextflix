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

      // Use a try-catch block specifically for localStorage access
      let item: string | null = null;
      try {
        item = localStorage.getItem(`cache_${key}`);
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        return null;
      }

      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const now = Date.now();

      // Check if cache is expired
      if (now - cacheItem.timestamp > cacheItem.expiry) {
        console.log(`Cache expired for ${key}`);
        try {
          localStorage.removeItem(`cache_${key}`);
        } catch (removeError) {
          console.error('Error removing from localStorage:', removeError);
        }
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

      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        console.log(`Cache set for ${key}, expires in ${expiry / 1000} seconds`);
      } catch (storageError) {
        console.error('Error writing to localStorage:', storageError);
        // Try to clear some space in localStorage
        try {
          // Remove oldest items first
          const keys = Object.keys(localStorage)
            .filter(k => k.startsWith('cache_'))
            .sort((a, b) => {
              try {
                const itemA = JSON.parse(localStorage.getItem(a) || '{}');
                const itemB = JSON.parse(localStorage.getItem(b) || '{}');
                return (itemA.timestamp || 0) - (itemB.timestamp || 0);
              } catch (e) {
                return 0;
              }
            });

          // Remove up to 5 oldest items
          for (let i = 0; i < Math.min(5, keys.length); i++) {
            localStorage.removeItem(keys[i]);
          }

          // Try again
          localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
        } catch (e) {
          console.error('Failed to make space in localStorage:', e);
        }
      }
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

      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (storageError) {
        console.error('Error removing from localStorage:', storageError);
      }
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

      try {
        // Only clear items with our cache prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cache_')) {
            keysToRemove.push(key);
          }
        }

        // Remove items in a separate loop to avoid issues with changing indices
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (removeError) {
            console.error(`Error removing key ${key}:`, removeError);
          }
        });
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
      }
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
