'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface BackToTopProps {
  threshold?: number; // Scroll threshold in pixels to show the button
  smooth?: boolean; // Whether to use smooth scrolling
}

export function BackToTop({ threshold = 300, smooth = true }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  // Scroll to top function
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="Back to top"
    >
      <ChevronUp size={24} />
    </button>
  );
}
