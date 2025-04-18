'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Prevent default link behavior
    e.preventDefault();

    // Show loading state immediately for any navigation
    setIsLoading(true);
    startLoading();
    triggerGlobalLoading();

    // Call onClick handler if provided
    if (onClick) onClick();

    // Navigate to the link
    router.push(href);
  };

  return (
    <Link
      href={href}
      className={`relative block ${className}`}
      onClick={handleClick}
    >
      {children}
      <RippleEffect />
    </Link>
  );
}
