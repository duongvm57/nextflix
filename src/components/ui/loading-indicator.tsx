'use client';

import { useEffect, useState } from 'react';

// Global state setter
let setGlobalLoadingState: ((value: boolean) => void) | null = null;

// Function to trigger loading from outside components
export function triggerLoading() {
  if (setGlobalLoadingState) {
    setGlobalLoadingState(true);

    // Auto-hide after 1.5 seconds in case navigation doesn't happen
    setTimeout(() => {
      if (setGlobalLoadingState) setGlobalLoadingState(false);
    }, 1500);
  }
}

export function LoadingIndicator() {
  const [isLoading, setIsLoading] = useState(false);

  // Store the setIsLoading function in the global variable
  useEffect(() => {
    setGlobalLoadingState = setIsLoading;
    return () => {
      setGlobalLoadingState = null;
    };
  }, []);

  // Listen for clicks on links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest('a');

      if (closestLink) {
        const href = closestLink.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith('http'))) {
          setIsLoading(true);

          // Hide loading after a longer delay
          setTimeout(() => {
            setIsLoading(false);
          }, 1500);
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 z-50 h-2 w-full bg-blue-500/20">
      <div className="h-full w-2/5 animate-loading-bar bg-blue-600"></div>
    </div>
  );
}

// Thêm animation vào tailwind.config.ts
// keyframes: {
//   'loading-bar': {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(400%)' },
//   },
// },
// animation: {
//   'loading-bar': 'loading-bar 1.5s ease-in-out infinite',
// },
