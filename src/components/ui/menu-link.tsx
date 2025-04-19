'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { RippleEffect } from './ripple-effect';
import { triggerGlobalLoading } from '@/providers/loading-provider';
import { useLoading } from '@/providers/loading-provider';

interface MenuLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function MenuLink({ href, className = '', children, onClick }: MenuLinkProps) {
  const router = useRouter();
  const [, setIsLoading] = useState(false);
  const { startLoading } = useLoading();
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleNavigation = useCallback(() => {
    // Show loading state immediately for any navigation
    setIsLoading(true);
    startLoading();
    triggerGlobalLoading();

    // Call onClick handler if provided
    if (onClick) onClick();

    // Navigate to the link
    router.push(href);
  }, [href, onClick, router, setIsLoading, startLoading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default link behavior
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
    <Link ref={linkRef} href={href} className={`relative block ${className}`} onClick={handleClick}>
      {children}
      <RippleEffect />
    </Link>
  );
}
