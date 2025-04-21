'use client';

import { MenuLink } from '@/components/ui/menu-link';

interface InternalLinksProps {
  title: string;
  links: Array<{
    name: string;
    url: string;
    color?: string; // Optional color for gradient
  }>;
  className?: string;
  showAll?: boolean; // Whether to show all links or just the first row
  allTopicsUrl?: string; // URL for "See all topics" button
}

// Predefined gradient colors for cards - dark monochrome with gradient from left to right
const gradients = [
  'from-gray-900/95 to-gray-800/95', // Darkest gray
  'from-gray-800/90 to-gray-700/90', // Dark gray
  'from-gray-700/85 to-gray-600/85', // Medium-dark gray
  'from-gray-600/80 to-gray-500/80', // Medium gray
  'from-gray-500/75 to-gray-400/75', // Medium-light gray
  'from-gray-400/70 to-gray-300/70', // Light gray
  'from-gray-300/65 to-gray-200/65', // Lightest gray
];

export function InternalLinks({
  title,
  links,
  className = '',
  showAll = false,
  allTopicsUrl = '/chu-de',
}: InternalLinksProps) {
  if (!links || links.length === 0) return null;

  // Determine how many items to show in a single row
  const itemsPerRow = 7; // Maximum items in a row
  const visibleLinks = showAll ? links : links.slice(0, itemsPerRow - 1); // -1 to make room for "more" button
  const hasMoreLinks = !showAll && links.length > itemsPerRow - 1;

  // Calculate equal width for all items
  const totalItems = hasMoreLinks ? visibleLinks.length + 1 : visibleLinks.length;
  const itemWidth = `calc(100% / ${totalItems})`; // Create a string for the width calculation

  // Ensure we have a consistent layout

  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="mb-4 text-2xl font-bold">{title}</h2>
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex justify-between gap-3 pb-1 w-full">
          {visibleLinks.map((link, index) => {
            // Use provided color or pick from predefined gradients
            const gradientClass = link.color || gradients[index % gradients.length];

            return (
              <MenuLink
                key={link.url}
                href={link.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex-1 min-w-[160px] h-[90px] flex items-center justify-center border border-gray-700 hover:border-gray-500`}
                style={{ width: itemWidth }}
              >
                <span className="text-center">
                  <span className="font-medium block">{link.name}</span>
                  <span className="text-xs opacity-80 mt-1 block">Xem thêm &gt;</span>
                </span>
              </MenuLink>
            );
          })}

          {/* "More topics" button */}
          {hasMoreLinks && (
            <MenuLink
              href={allTopicsUrl}
              className={`bg-gradient-to-r from-gray-500/75 to-gray-400/75 rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex-1 min-w-[160px] h-[90px] flex items-center justify-center border border-gray-700 hover:border-gray-500`}
              style={{ width: itemWidth }}
            >
              <span className="text-center">
                <span className="font-medium block">Tất cả</span>
                <span className="text-xs opacity-80 mt-1 block">Xem tất cả &gt;</span>
              </span>
            </MenuLink>
          )}
        </div>
      </div>
    </div>
  );
}
