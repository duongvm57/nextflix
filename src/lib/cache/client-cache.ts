/**
 * Client-side cache utility for API responses
 * This helps reduce API calls by storing responses in localStorage
 */

import { CACHE_CONFIG } from '@/lib/config/cache-config';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Cache item interface
interface CacheItem<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  set<T>(key: string, data: T, duration: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + duration,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Shared memory cache instance
const memoryCache = new MemoryCache();

/**
 * Client-side cache utility
 */
export const clientCache = {
  get<T>(key: string): T | null {
    try {
      // Always try memory cache first (works in both client & server)
      const memoryData = memoryCache.get<T>(key);
      if (memoryData) {
        return memoryData;
      }

      // Only try sessionStorage if we're on the client
      if (isClient) {
        const item = sessionStorage.getItem(`cache_${key}`);
        if (!item) {
          return null;
        }

        const cacheItem: CacheItem<T> = JSON.parse(item);
        if (Date.now() > cacheItem.expiry) {
          sessionStorage.removeItem(`cache_${key}`);
          return null;
        }

        // Cache in memory for faster subsequent access
        memoryCache.set(key, cacheItem.data, cacheItem.expiry - Date.now());
        return cacheItem.data;
      }

      return null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  },

  set<T>(key: string, data: T, duration: number): void {
    try {
      // Always set in memory cache (works in both client & server)
      memoryCache.set(key, data, duration);

      // Only set in sessionStorage if we're on the client
      if (isClient) {
        const cacheItem: CacheItem<T> = {
          data,
          expiry: Date.now() + duration,
        };
        sessionStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
      }
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  },

  remove(key: string): void {
    try {
      memoryCache.delete(key);
      if (isClient) {
        sessionStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  },

  clear(): void {
    try {
      memoryCache.clear();
      if (isClient) {
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};

// Cache duration constants
export const CACHE_DURATION = {
  MENU: 60 * 60 * 1000, // 1 hour
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  COUNTRIES: 60 * 60 * 1000, // 1 hour
  MOVIES: 5 * 60 * 1000, // 5 minutes
};

/**
 * Memoize a function with caching
 * @param fn Function to memoize
 * @param keyFn Function to generate cache key from arguments
 * @param duration Cache duration in milliseconds
 * @returns Memoized function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function memoize<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args),
  duration: number = CACHE_DURATION.MENU
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const cached = clientCache.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    if (result) {
      clientCache.set(key, result, duration);
    }

    return result;
  };
}

// Re-export cache durations
export { CACHE_CONFIG };
