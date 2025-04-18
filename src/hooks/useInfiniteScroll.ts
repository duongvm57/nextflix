import { useEffect, useState, useCallback, RefObject } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger loading (in pixels)
  initialPage?: number;
}

export function useInfiniteScroll(
  scrollRef: RefObject<HTMLElement>,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 200, initialPage = 1 } = options;
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      setPage(prevPage => prevPage + 1);
    }
  }, [isLoading, hasMore]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const scrollElement = scrollRef.current;
    const scrollPosition = window.innerHeight + window.scrollY;
    const scrollHeight = scrollElement.scrollHeight || document.documentElement.scrollHeight;

    // If we're close to the bottom, load more
    if (scrollHeight - scrollPosition < threshold) {
      loadMore();
    }
  }, [scrollRef, isLoading, hasMore, threshold, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return {
    page,
    setPage,
    isLoading,
    setIsLoading,
    hasMore,
    setHasMore,
    loadMore,
  };
}
