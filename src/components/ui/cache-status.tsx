'use client';

import { useState, useEffect, useRef } from 'react';
import { clientCache } from '@/lib/cache/client-cache';

interface MemoryCache {
  cache: Map<string, unknown>;
}

interface InternalClientCache {
  memoryCache: MemoryCache;
}

interface CacheInfo {
  client: {
    memory: {
      totalItems: number;
      keys: string[];
    };
    session: {
      totalItems: number;
      keys: string[];
      totalSize: number;
    };
  };
  server: {
    status: 'active' | 'inactive';
    lastRevalidated?: Date;
  };
}

function getMemoryCacheKeys(cache: unknown): string[] {
  const internalCache = cache as InternalClientCache;
  if (internalCache?.memoryCache?.cache instanceof Map) {
    return Array.from(internalCache.memoryCache.cache.keys());
  }
  return [];
}

export function CacheStatus() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    client: {
      memory: {
        totalItems: 0,
        keys: [],
      },
      session: {
        totalItems: 0,
        keys: [],
        totalSize: 0,
      },
    },
    server: {
      status: 'active',
    },
  });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isVisible &&
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const getCacheInfo = () => {
    if (typeof window === 'undefined') return;

    try {
      // Get session storage info
      const sessionKeys: string[] = [];
      let sessionTotalSize = 0;

      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith('cache_')) {
            sessionKeys.push(key);
            const item = sessionStorage.getItem(key);
            if (item) {
              sessionTotalSize += item.length;
            }
          }
        }
      } catch (storageError) {
        console.error('Error accessing sessionStorage:', storageError);
      }

      // Get memory cache info
      const memoryKeys = getMemoryCacheKeys(clientCache);

      setCacheInfo(prev => ({
        ...prev,
        client: {
          memory: {
            totalItems: memoryKeys.length,
            keys: memoryKeys as string[],
          },
          session: {
            totalItems: sessionKeys.length,
            keys: sessionKeys,
            totalSize: Math.round(sessionTotalSize / 1024),
          },
        },
      }));
    } catch (error) {
      console.error('Error getting cache info:', error);
    }
  };

  // Clear client cache only
  const clearClientCache = () => {
    clientCache.clear();
    getCacheInfo();
  };

  // Revalidate server cache through API
  const revalidateServerCache = async () => {
    try {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: ['categories', 'countries', 'menu'],
        }),
      });

      if (response.ok) {
        setCacheInfo(prev => ({
          ...prev,
          server: {
            status: 'active',
            lastRevalidated: new Date(),
          },
        }));
      }
    } catch (error) {
      console.error('Error revalidating cache:', error);
    }
  };

  // Toggle visibility
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      getCacheInfo();
    }
  };

  // Update cache info when visible
  useEffect(() => {
    if (isVisible) {
      getCacheInfo();
      const interval = setInterval(getCacheInfo, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        ref={buttonRef}
        onClick={toggleVisibility}
        className="fixed bottom-4 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        title="Hiển thị trạng thái cache"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </button>

      {isVisible && (
        <div
          ref={popupRef}
          className="absolute bottom-12 right-0 bg-gray-800 text-white p-4 rounded-lg shadow-xl w-96"
        >
          <h3 className="text-lg font-semibold mb-4">Cache Status</h3>

          {/* Client Cache Section */}
          <div className="mb-6">
            <h4 className="font-medium text-blue-400 mb-2">Client Cache</h4>

            {/* Memory Cache */}
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-1">Memory Cache:</h5>
              <p className="text-sm">Items: {cacheInfo.client.memory.totalItems}</p>
              <div className="mt-1">
                <p className="text-xs text-gray-400">Cached Keys:</p>
                <div className="max-h-20 overflow-y-auto text-xs">
                  {cacheInfo.client.memory.keys.map(key => (
                    <div key={key} className="truncate text-gray-300">
                      {key}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Storage */}
            <div className="mb-3">
              <h5 className="text-sm font-medium mb-1">Session Storage:</h5>
              <p className="text-sm">
                Items: {cacheInfo.client.session.totalItems} ({cacheInfo.client.session.totalSize}{' '}
                KB)
              </p>
              <div className="mt-1">
                <p className="text-xs text-gray-400">Cached Keys:</p>
                <div className="max-h-20 overflow-y-auto text-xs">
                  {cacheInfo.client.session.keys.map(key => (
                    <div key={key} className="truncate text-gray-300">
                      {key.replace('cache_', '')}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={clearClientCache}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mt-2"
            >
              Clear Client Cache
            </button>
          </div>

          {/* Server Cache Section */}
          <div className="mb-4">
            <h4 className="font-medium text-green-400 mb-2">Server Cache</h4>
            <p className="text-sm">
              Status: <span className="text-green-500">●</span> {cacheInfo.server.status}
            </p>
            {cacheInfo.server.lastRevalidated && (
              <p className="text-sm">
                Last Revalidated: {cacheInfo.server.lastRevalidated.toLocaleString()}
              </p>
            )}
            <button
              onClick={revalidateServerCache}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm mt-2"
            >
              Revalidate Server Cache
            </button>
          </div>

          <div className="text-xs text-gray-400 mt-4">
            <p>Note: Browser HTTP Cache can be cleared from browser settings</p>
          </div>
        </div>
      )}
    </div>
  );
}
