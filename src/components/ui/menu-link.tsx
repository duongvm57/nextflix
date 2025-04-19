'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';
import { clientCache } from '@/lib/cache/client-cache';
import { CACHE_CONFIG } from '@/lib/config/cache-config';
import { RippleEffect } from './ripple-effect';
import { useLoading } from '@/providers/loading-provider';

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

  // Prefetch only important links to reduce RSC requests
  useEffect(() => {
    // Skip prefetching for anchor links and external links
    if (href.startsWith('#') || href.startsWith('http')) {
      return;
    }

    // Skip if already prefetched
    if (prefetchedLinks.current.has(href)) {
      console.log(`[PREFETCH] Link already prefetched: ${href}`);
      return;
    }

    // Only prefetch important links
    const importantPaths = [
      '/',
      '/categories/phim-le',
      '/categories/phim-bo',
      '/categories/hoat-hinh',
      '/countries/han-quoc',
      '/countries/trung-quoc',
      '/countries/au-my',
      '/genres/hanh-dong',
      '/genres/tinh-cam',
    ];

    if (importantPaths.includes(href)) {
      // Mark as prefetched
      prefetchedLinks.current.add(href);
      console.log(`[PREFETCH] Prefetching important link: ${href}`);

      // Use Next.js router to prefetch the page
      router.prefetch(href);

      // Store in cache that we've prefetched this link
      const prefetchedLinksCache = clientCache.get<string[]>('prefetched_links') || [];
      if (!prefetchedLinksCache.includes(href)) {
        console.log(`[PREFETCH] Adding link to prefetched_links cache: ${href}`);
        clientCache.set(
          'prefetched_links',
          [...prefetchedLinksCache, href],
          CACHE_CONFIG.CLIENT.NAVIGATION
        );
      }
    }
  }, [href, router]);

  const handleNavigation = useCallback(() => {
    // Prevent multiple navigations
    if (isNavigating.current) {
      console.log(`[NAVIGATION] Already navigating to ${href}, ignoring click`);
      return;
    }

    console.log(`[NAVIGATION] Starting navigation to ${href}`);
    isNavigating.current = true;

    // Single loading trigger
    startLoading();

    // Call onClick handler if provided
    if (onClick) onClick();

    // Navigate using push
    router.push(href);

    // Reset navigation flag after a delay
    setTimeout(() => {
      console.log(`[NAVIGATION] Navigation flag reset for ${href}`);
      isNavigating.current = false;
    }, 300);
  }, [href, onClick, router, startLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    handleNavigation();
  };

  // Add touch event handler for mobile devices with balanced approach
  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouchMoved = false;
    const TOUCH_THRESHOLD = 5; // Smaller threshold for better detection
    const TAP_DURATION_THRESHOLD = 300; // Max milliseconds for a tap

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
        handleNavigation();
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
  }, [href, handleNavigation]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={`relative block ${className}`}
      onClick={handleClick}
      prefetch={false} // Disable Next.js automatic prefetching, we handle it manually
    >
      {children}
      <RippleEffect />
    </Link>
  );
}
