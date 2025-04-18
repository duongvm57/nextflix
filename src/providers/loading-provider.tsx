'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create context
interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Provider component
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  // Start loading - will trigger LoadingText to show
  const startLoading = useCallback(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation started');
    }
    // Force loading state to true
    setIsLoading(true);
  }, []);

  // Stop loading
  const stopLoading = useCallback(() => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation completed');
    }
    // Force loading state to false
    setIsLoading(false);
  }, []);

  // Auto-hide loading after timeout (shorter timeout)
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Maximum loading time - reduced to 1 second
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for ESLint
  }, [isLoading]);

  // Track clicks on links
  useEffect(() => {
    // Function to handle navigation start
    const handleNavigationStart = () => {
      startLoading();
    };

    // Track clicks on any element that might be a link
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closestLink = target.closest('a');

      if (closestLink) {
        const href = closestLink.getAttribute('href');
        if (href && (href.startsWith('/') || href.startsWith('http'))) {
          handleNavigationStart();
        }
      }
    };

    document.addEventListener('click', handleClick);

    // Track URL changes for browser back/forward navigation
    const handleUrlChange = () => {
      handleNavigationStart();
    };

    // Use the popstate event to detect browser back/forward navigation
    window.addEventListener('popstate', handleUrlChange);

    // Clean up
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [startLoading]);

  // We no longer track route changes here to avoid infinite loops

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

// Custom hook to use the loading context
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Export function to trigger loading from outside components
export function triggerGlobalLoading() {
  // This is just a placeholder function that's called by MenuLink
  // The actual loading is handled by the LoadingProvider
  if (process.env.NODE_ENV === 'development') {
    console.log('Global loading triggered');
  }
}
