'use client';

import { useState, useEffect } from 'react';
import { clientCache } from '@/lib/cache/client-cache';

interface CacheInfo {
  totalItems: number;
  keys: string[];
  totalSize: number;
}

export function CacheStatus() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo>({
    totalItems: 0,
    keys: [],
    totalSize: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  // Get cache info
  const getCacheInfo = () => {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      let totalSize = 0;

      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      });

      setCacheInfo({
        totalItems: keys.length,
        keys,
        totalSize: Math.round(totalSize / 1024), // Convert to KB
      });
    } catch (error) {
      console.error('Error getting cache info:', error);
    }
  };

  // Clear cache
  const clearCache = () => {
    clientCache.clear();
    getCacheInfo();
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

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-500 p-2 text-white shadow-lg"
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
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg bg-gray-800 p-4 text-white shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trạng thái Cache</h3>
        <button
          onClick={toggleVisibility}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="mb-3 space-y-1 text-sm">
        <p>Số lượng item: {cacheInfo.totalItems}</p>
        <p>Kích thước: {cacheInfo.totalSize} KB</p>
      </div>

      <div className="mb-3 max-h-40 overflow-y-auto text-xs">
        <p className="mb-1 font-semibold">Cache keys:</p>
        <ul className="space-y-1">
          {cacheInfo.keys.map(key => (
            <li key={key} className="truncate">
              {key.replace('cache_', '')}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={clearCache}
        className="w-full rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
      >
        Xóa tất cả cache
      </button>
    </div>
  );
}
