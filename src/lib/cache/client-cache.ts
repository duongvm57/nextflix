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

// Định nghĩa kiểu cho window object với thuộc tính __MEMORY_CACHE
declare global {
  interface Window {
    __MEMORY_CACHE?: MemoryCache;
  }
}

class MemoryCache {
  private cache: Map<string, CacheItem<unknown>>;

  constructor() {
    this.cache = new Map();

    // Khôi phục từ session storage khi khởi tạo (chỉ khi ở client-side)
    if (isClient) {
      this.restoreFromSessionStorage();
    }
  }

  // Phương thức khôi phục dữ liệu từ session storage
  private restoreFromSessionStorage(): void {
    try {
      console.log('[MEMORY_CACHE] Restoring from session storage');
      let restoredCount = 0;

      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('cache_')) {
          const realKey = key.replace('cache_', '');
          const item = sessionStorage.getItem(key);

          if (item) {
            try {
              const cacheItem = JSON.parse(item) as CacheItem<unknown>;

              // Chỉ khôi phục các mục chưa hết hạn
              if (Date.now() <= cacheItem.expiry) {
                this.cache.set(realKey, {
                  data: cacheItem.data,
                  expiry: cacheItem.expiry,
                });
                restoredCount++;
              }
            } catch (parseError) {
              console.error(`[MEMORY_CACHE] Error parsing item ${key}:`, parseError);
            }
          }
        }
      }

      console.log(`[MEMORY_CACHE] Restored ${restoredCount} items from session storage`);
    } catch (error) {
      console.error('[MEMORY_CACHE] Error restoring from session storage:', error);
    }
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

  debug(): void {
    console.log('[MEMORY_CACHE] Debug info:');
    console.log(`Total items: ${this.cache.size}`);
    console.log('Keys:', this.getKeys());
  }
}

// Tạo hoặc sử dụng memory cache toàn cục
let memoryCache: MemoryCache;

// Sử dụng window object để lưu trữ memory cache ở client-side
if (isClient) {
  // Kiểm tra xem đã có memory cache trong window chưa
  if (!window.__MEMORY_CACHE) {
    console.log('[MEMORY_CACHE] Creating new global memory cache');
    window.__MEMORY_CACHE = new MemoryCache();
  } else {
    console.log('[MEMORY_CACHE] Using existing global memory cache');
  }

  memoryCache = window.__MEMORY_CACHE;
} else {
  // Fallback cho server-side rendering
  memoryCache = new MemoryCache();
}

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

        try {
          const cacheItem: CacheItem<T> = JSON.parse(item);
          if (Date.now() > cacheItem.expiry) {
            // Xóa mục đã hết hạn
            sessionStorage.removeItem(`cache_${key}`);
            return null;
          }

          // Cache in memory for faster subsequent access
          // Vì memory cache giờ đã là toàn cục, nó sẽ tồn tại xuyên suốt các lần chuyển trang
          memoryCache.set(key, cacheItem.data, cacheItem.expiry - Date.now());
          return cacheItem.data;
        } catch (parseError) {
          console.error(`Error parsing cache item for key ${key}:`, parseError);
          // Xóa mục không hợp lệ
          sessionStorage.removeItem(`cache_${key}`);
          return null;
        }
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
      console.log('[CACHE] Clearing all cache data');
      // Xóa memory cache
      memoryCache.clear();

      // Xóa session storage cache
      if (isClient) {
        let removedCount = 0;
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key);
            removedCount++;
          }
        });

        // Also clear navigation-related session storage items
        sessionStorage.removeItem('lastUrl');
        sessionStorage.removeItem('targetUrl');

        console.log(`[CACHE] Removed ${removedCount} items from session storage`);
      }
    } catch (error) {
      console.error('[CACHE] Error clearing cache:', error);
    }
  },

  // Expose memory cache keys for debugging
  getMemoryCacheKeys(): string[] {
    try {
      return memoryCache.getKeys();
    } catch (error) {
      console.error('[CACHE] Error getting memory cache keys:', error);
      return [];
    }
  },

  // Phương thức debug toàn bộ hệ thống cache
  debug(): void {
    try {
      console.group('[CACHE] Debug Information');

      // Thông tin memory cache
      const memoryKeys = memoryCache.getKeys();
      console.log('Memory Cache:');
      console.log(`- Total items: ${memoryKeys.length}`);
      console.log('- Keys:', memoryKeys);

      // Thông tin session storage
      if (isClient) {
        const sessionKeys: string[] = [];
        let sessionSize = 0;

        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('cache_')) {
            sessionKeys.push(key.replace('cache_', ''));
            const item = sessionStorage.getItem(key);
            if (item) {
              sessionSize += item.length;
            }
          }
        }

        console.log('Session Storage Cache:');
        console.log(`- Total items: ${sessionKeys.length}`);
        console.log(`- Total size: ${Math.round(sessionSize / 1024)} KB`);
        console.log('- Keys:', sessionKeys);
      }

      console.groupEnd();
    } catch (error) {
      console.error('[CACHE] Error in debug:', error);
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
