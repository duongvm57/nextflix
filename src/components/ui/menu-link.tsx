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

  // Add touch event handler for mobile devices
  useEffect(() => {
    const linkElement = linkRef.current;
    if (!linkElement) return;

    const handleTouchEnd = (e: TouchEvent) => {
      // Only prevent default if this is a navigation link
      if (href && href !== '#') {
        e.preventDefault();
      }
      handleNavigation();
    };

    linkElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      linkElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [href, handleNavigation]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={`relative block ${className}`}
      onClick={handleClick}
    >
      {children}
      <RippleEffect />
    </Link>
  );
}
