'use client';

import { LoadingSpinner } from './loading-spinner';

export function MenuSkeleton() {
  // Option 1: Use loading spinner
  return (
    <div className="flex items-center">
      <LoadingSpinner size="sm" text="" />
      <span className="ml-2 text-sm font-medium text-gray-400">Đang tải menu...</span>
    </div>
  );

  // Option 2: Use skeleton (commented out but available if needed)
  /*
  return (
    <div className="flex space-x-8 animate-pulse">
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
    </div>
  );
  */
}
