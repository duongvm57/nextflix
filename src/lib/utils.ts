import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine Tailwind classes with clsx and twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format view count (e.g., 1000 -> 1K)
export function formatViewCount(count?: number): string {
  if (count === undefined || count === null) return '0';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Get image URL with fallback
export function getImageUrl(url: string, fallback: string = '/placeholder.jpg'): string {
  if (!url) return fallback;

  if (url.startsWith('http')) {
    if (url.includes('phimapi.com') || url.includes('phimimg.com')) {
      const cacheBuster = Date.now();
      return url.includes('?') ? `${url}&_cb=${cacheBuster}` : `${url}?_cb=${cacheBuster}`;
    }
    return url;
  }

  if (url.startsWith('/')) {
    const cacheBuster = Date.now();
    return `https://img.phimapi.com${url}?_cb=${cacheBuster}`;
  }

  const cacheBuster = Date.now();
  return `https://img.phimapi.com/${url}?_cb=${cacheBuster}`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
