'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Create context
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

// Provider component
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  // Start loading - will trigger LoadingText to show
  const startLoading = useCallback(() => {
    // Prevent multiple loading triggers
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setIsLoading(true);
  }, []);

  // Stop loading
  const stopLoading = useCallback(() => {
    // Add a small delay before hiding loading state
    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      isLoadingRef.current = false;
    }, 300);
  }, []);

  // Auto-hide loading after timeout (shorter timeout)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        isLoadingRef.current = false;
      }, 800); // Maximum loading time - reduced to 800ms for better UX
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for ESLint
  }, [isLoading]);

  // Track only popstate events (back/forward navigation)
  // We don't track link clicks here anymore as MenuLink handles that
  useEffect(() => {
    // Track URL changes for browser back/forward navigation
    const handleUrlChange = () => {
      startLoading();
    };

    // Use the popstate event to detect browser back/forward navigation
    window.addEventListener('popstate', handleUrlChange);

    // Clean up
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [startLoading]);

  // We no longer track route changes here to avoid infinite loops

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && (
        <>
          {/* Loading bar at the top */}
          <div className="fixed top-0 left-0 z-50 h-1 w-full bg-blue-500/20">
            <div className="h-full w-1/3 animate-loading-bar bg-blue-600"></div>
          </div>

          {/* Small loading spinner in the corner */}
          {/* <div className="fixed bottom-4 left-4 z-50">
            <LoadingSpinner size="sm" text="" />
          </div> */}
        </>
      )}
    </LoadingContext.Provider>
  );
}

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Export function to trigger loading from outside components
export function triggerGlobalLoading() {
  // This is just a placeholder function that's called by MenuLink
  // The actual loading is handled by the LoadingProvider
  if (process.env.NODE_ENV === 'development') {
    console.log('Global loading triggered');
  }
}
