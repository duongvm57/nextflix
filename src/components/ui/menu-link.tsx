'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';
import { clientCache } from '@/lib/cache/client-cache';
import { CACHE_CONFIG } from '@/lib/config/cache-config';
import { RippleEffect } from './ripple-effect';
import { useLoading } from '@/providers/loading-provider';
import { clearNavigationState as clearNavState } from '@/utils/navigation-debug';

interface MenuLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function MenuLink({ href, className = '', children, onClick }: MenuLinkProps) {
  const router = useRouter();
  const { startLoading } = useLoading();
  const isNavigating = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Track visited links to avoid unnecessary prefetching
  const prefetchedLinks = useRef<Set<string>>(new Set());

  // Tối ưu hóa prefetching để cải thiện hiệu suất
  useEffect(() => {
    // Skip prefetching for anchor links and external links
    if (href.startsWith('#') || href.startsWith('http')) {
      return;
    }

    // Skip if already prefetched
    if (prefetchedLinks.current.has(href)) {
      return;
    }

    // Mở rộng danh sách các đường dẫn cần prefetch
    const essentialPaths = [
      '/',
      '/danh-muc/phim-le',
      '/danh-muc/phim-bo',
      '/danh-muc/tv-shows',
      '/danh-muc/hoat-hinh',
      '/chu-de',
      '/tim-kiem'
    ];

    // Prefetch các trang thông tin phim và trang xem phim
    const isMovieDetailLink = href.startsWith('/phim/');
    const isWatchLink = href.startsWith('/xem/');
    const isCategoryLink = href.startsWith('/the-loai/');
    const isCountryLink = href.startsWith('/quoc-gia/');

    // Prefetch các trang quan trọng và các trang phim
    const shouldPrefetch =
      essentialPaths.includes(href) ||
      isMovieDetailLink ||
      isWatchLink ||
      isCategoryLink ||
      isCountryLink;

    if (shouldPrefetch) {
      // Mark as prefetched
      prefetchedLinks.current.add(href);

      // Chỉ log trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[PREFETCH] Prefetching link: ${href}`);
      }

      // Use Next.js router to prefetch the page
      router.prefetch(href);

      // Store in cache that we've prefetched this link
      const prefetchedLinksCache = clientCache.get<string[]>('prefetched_links') || [];
      if (!prefetchedLinksCache.includes(href)) {
        clientCache.set(
          'prefetched_links',
          [...prefetchedLinksCache, href],
          CACHE_CONFIG.CLIENT.PREFETCHED_LINKS
        );
      }
    }
  }, [href, router]);

  // Helper function to clear any stale navigation state
  const clearNavigationState = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Use the utility function to clear navigation state
      clearNavState();

      // Reset the navigation flag
      isNavigating.current = false;
    }
  }, []);

  const handleNavigation = useCallback(() => {
    // Prevent multiple navigations
    if (isNavigating.current) {
      return;
    }

    // Check if we're already on the same page
    if (typeof window !== 'undefined' && window.location.pathname === href) {
      return;
    }

    // Clear any stale navigation state first
    clearNavigationState();

    isNavigating.current = true;

    // Single loading trigger
    startLoading();

    // Call onClick handler if provided
    if (onClick) onClick();

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('[NAVIGATION] Navigating to:', href);
    }

    try {
      // Kiểm tra xem đây có phải là link thông tin phim không
      const isMovieDetailLink = href.startsWith('/phim/');

      // Tối ưu hóa cách xử lý điều hướng
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isHomeLink = href === '/';

        // Xử lý đặc biệt cho link trang chủ
        if (isHomeLink) {
          // Xóa tất cả các biến sessionStorage liên quan đến điều hướng
          sessionStorage.removeItem('lastUrl');
          sessionStorage.removeItem('targetUrl');
          sessionStorage.removeItem('navigationMethod');
          sessionStorage.removeItem('currentPath');

          // Sử dụng router.push() để tận dụng client-side navigation
          router.push(href);
          return; // Kết thúc sớm
        }

        // Xử lý đặc biệt cho trường hợp từ trang xem phim sang trang thông tin phim
        if (isMovieDetailLink && currentPath.startsWith('/xem/')) {
          // Xóa tất cả các biến sessionStorage liên quan đến điều hướng
          // để tránh các vấn đề với script điều hướng
          sessionStorage.removeItem('lastUrl');
          sessionStorage.removeItem('targetUrl');
          sessionStorage.removeItem('navigationMethod');
          sessionStorage.removeItem('currentPath');

          // Sử dụng window.location.href để đảm bảo điều hướng đúng
          window.location.href = href;
          return; // Kết thúc sớm
        }
      }

      // Sử dụng router.push() cho các trường hợp còn lại để tận dụng client-side navigation
      router.push(href);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[NAVIGATION] Error navigating to ${href}:`, error);
      }

      // Fallback to direct navigation
      window.location.href = href;
    }

    // Reset navigation flag after a delay
    setTimeout(() => {
      isNavigating.current = false;
    }, 200); // Giảm thời gian delay xuống 200ms để cải thiện UX
  }, [href, onClick, router, startLoading, clearNavigationState]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleNavigation();
  };

  // Add touch event handler for mobile devices with improved reliability
  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchMoved = false;
    const TOUCH_THRESHOLD = 5; // Giảm ngưỡng để cải thiện độ nhạy
    const TAP_DURATION_THRESHOLD = 300; // Giảm thời gian tối đa cho một tap để cải thiện UX

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isTouchMoved = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchMoved) {
        const touchCurrentX = e.touches[0].clientX;
        const touchCurrentY = e.touches[0].clientY;
        const diffX = Math.abs(touchCurrentX - touchStartX);
        const diffY = Math.abs(touchCurrentY - touchStartY);

        // Mark as moved if threshold exceeded
        if (diffX > TOUCH_THRESHOLD || diffY > TOUCH_THRESHOLD) {
          isTouchMoved = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      // Only navigate if it was a tap (not moved) and short duration
      if (!isTouchMoved && touchDuration < TAP_DURATION_THRESHOLD && href && href !== '#') {
        e.preventDefault();
        e.stopPropagation();

        // Clear any existing navigation state from previous attempts
        clearNavigationState();

        // Giảm delay để cải thiện UX
        setTimeout(() => {
          handleNavigation();
        }, 10);
      }
    };

    linkElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    linkElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    linkElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      linkElement.removeEventListener('touchstart', handleTouchStart);
      linkElement.removeEventListener('touchmove', handleTouchMove);
      linkElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [href, handleNavigation, clearNavigationState]);

  // Tối ưu hóa component Link
  return (
    <Link
      ref={linkRef}
      href={href}
      className={`relative block ${className}`}
      onClick={handleClick}
      prefetch={true} // Bật prefetch của Next.js để cải thiện hiệu suất
    >
      {children}
      <RippleEffect />
    </Link>
  );
}
