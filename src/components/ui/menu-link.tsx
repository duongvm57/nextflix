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

    // Chỉ prefetch các trang quan trọng, không prefetch các trang phim để tránh chặn điều hướng
    const shouldPrefetch = essentialPaths.includes(href);

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

    // Kiểm tra xem đã ở trang hiện tại chưa, nhưng cho phép điều hướng nếu tham số query khác nhau
    if (typeof window !== 'undefined') {
      const currentPathname = window.location.pathname;
      const targetPathname = href.split('?')[0];

      // Nếu đang ở cùng một trang (pathname giống nhau)
      if (currentPathname === targetPathname) {
        // Kiểm tra xem có phải là trang phân trang không
        const isPaginationLink = href.includes('page=');
        const isSearchPage = targetPathname === '/tim-kiem';
        const isFilterPage = targetPathname.startsWith('/danh-muc/') ||
                            targetPathname.startsWith('/the-loai/') ||
                            targetPathname.startsWith('/quoc-gia/');

        // Nếu không phải trang phân trang, trang tìm kiếm hoặc trang lọc, không cần điều hướng
        if (!isPaginationLink && !isSearchPage && !isFilterPage) {
          return;
        }

        // Nếu là trang phân trang, trang tìm kiếm hoặc trang lọc, kiểm tra xem URL hiện tại và URL đích có giống nhau không
        if (window.location.href === new URL(href, window.location.origin).href) {
          return;
        }
      }
    }

    // Clear any stale navigation state first
    clearNavigationState();

    // Đánh dấu đang điều hướng ngay lập tức
    isNavigating.current = true;

    // Chỉ hiển thị loading cho các trang không phải trang phim
    // để đảm bảo điều hướng đến trang phim diễn ra ngay lập tức
    startLoading();

    // Call onClick handler if provided
    if (onClick) onClick();

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.log('[NAVIGATION] Navigating to:', href);
    }

    try {
      // Phân tích URL để xử lý đúng
      const url = new URL(href, window.location.origin);
      const pathname = url.pathname;
      const search = url.search;

      // Kiểm tra các loại trang đặc biệt
      const isMovieDetailLink = pathname.startsWith('/phim/');
      const isSearchPage = pathname === '/tim-kiem';
      const isHomeLink = pathname === '/';
      const isPaginationLink = search.includes('page=');
      const isFilterPage = pathname.startsWith('/danh-muc/') ||
                          pathname.startsWith('/the-loai/') ||
                          pathname.startsWith('/quoc-gia/');

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;

        // Lưu trữ thông tin điều hướng để tránh chuyển hướng về trang chủ
        if (!isHomeLink) {
          // Đặt phương thức điều hướng dựa trên loại trang
          let navigationMethod = 'menu_link';

          if (isPaginationLink) {
            navigationMethod = 'pagination';
          } else if (isFilterPage) {
            navigationMethod = 'filter';
          } else if (isSearchPage) {
            navigationMethod = 'search';
          }

          sessionStorage.setItem('lastUrl', currentPath);
          sessionStorage.setItem('targetUrl', href);
          sessionStorage.setItem('navigationMethod', navigationMethod);
        }

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

        // Xử lý đặc biệt cho trang tìm kiếm và trang phân trang
        if (isSearchPage || isPaginationLink || isFilterPage) {
          // Đảm bảo lưu thông tin điều hướng
          sessionStorage.setItem('lastUrl', currentPath);
          sessionStorage.setItem('targetUrl', href);

          // Đặt phương thức điều hướng dựa trên loại trang
          let navigationMethod = 'menu_link';
          if (isPaginationLink) {
            navigationMethod = 'pagination';
          } else if (isFilterPage) {
            navigationMethod = 'filter';
          } else if (isSearchPage) {
            navigationMethod = 'search';
          }

          sessionStorage.setItem('navigationMethod', navigationMethod);

          // Sử dụng router.push() để tận dụng client-side navigation
          router.push(href);
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

    // Kiểm tra xem href có phải là link phân trang không
    const isPaginationLink = href.includes('page=');

    // Nếu là link phân trang, thêm thông tin vào sessionStorage
    if (isPaginationLink && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      sessionStorage.setItem('lastUrl', currentPath);
      sessionStorage.setItem('targetUrl', href);
      sessionStorage.setItem('navigationMethod', 'pagination');

      // Log thông tin điều hướng trong môi trường development
      if (process.env.NODE_ENV === 'development') {
        console.log('[PAGINATION] Navigating to:', href);
        console.log('[PAGINATION] Current path:', currentPath);
      }
    }

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

        // Kiểm tra xem href có phải là link phân trang không
        const isPaginationLink = href.includes('page=');

        // Nếu là link phân trang, thêm thông tin vào sessionStorage
        if (isPaginationLink && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          sessionStorage.setItem('lastUrl', currentPath);
          sessionStorage.setItem('targetUrl', href);
          sessionStorage.setItem('navigationMethod', 'pagination');

          // Log thông tin điều hướng trong môi trường development
          if (process.env.NODE_ENV === 'development') {
            console.log('[PAGINATION_TOUCH] Navigating to:', href);
            console.log('[PAGINATION_TOUCH] Current path:', currentPath);
          }
        }

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
      prefetch={false} // Tắt prefetch mặc định để tránh chặn điều hướng
    >
      {children}
      <RippleEffect />
    </Link>
  );
}
