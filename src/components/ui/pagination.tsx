"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuLink } from '@/components/ui/menu-link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  onPageChange,
  className = '',
}: PaginationProps) {
  // Get current search params to preserve them when changing pages
  const searchParams = useSearchParams();

  // Function to create URL with preserved query params
  const createPageUrl = (page: number) => {
    if (!baseUrl) return '#';

    // Kiểm tra xem baseUrl đã có tham số query chưa
    const hasQueryParams = baseUrl.includes('?');

    // Tạo URL cơ sở không có tham số query
    const baseUrlWithoutParams = hasQueryParams ? baseUrl.split('?')[0] : baseUrl;

    // Tạo đối tượng URLSearchParams từ tham số hiện tại trong baseUrl (nếu có)
    const baseUrlParams = hasQueryParams
      ? new URLSearchParams(baseUrl.split('?')[1])
      : new URLSearchParams();

    // Thêm các tham số từ searchParams hiện tại
    const currentParams = new URLSearchParams(searchParams?.toString());
    currentParams.forEach((value, key) => {
      // Không ghi đè các tham số đã có trong baseUrl
      if (!baseUrlParams.has(key)) {
        baseUrlParams.set(key, value);
      }
    });

    // Cập nhật hoặc thêm tham số page
    baseUrlParams.set('page', page.toString());

    // Lưu trữ thông tin điều hướng để tránh chuyển hướng về trang chủ
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const url = `${baseUrlWithoutParams}?${baseUrlParams.toString()}`;
      sessionStorage.setItem('lastUrl', currentPath);
      sessionStorage.setItem('targetUrl', url);
      sessionStorage.setItem('navigationMethod', 'pagination');
    }

    // Trả về URL với tất cả các tham số
    return `${baseUrlWithoutParams}?${baseUrlParams.toString()}`;
  };
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add page range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-center gap-2 py-8 ${className}`}>
      {/* Previous button - optimized */}
      {baseUrl ? (
        <MenuLink
          href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md border pagination-button',
            currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
          )}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </MenuLink>
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border pagination-button disabled:opacity-50"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Page numbers - optimized */}
      {pageNumbers.map((page, index) => {
        // Ellipsis
        if (page === '...')
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          );

        // Page number
        const isActive = currentPage === page;
        const className = cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-md',
          isActive ? 'bg-blue-500 text-white' : 'border pagination-button'
        );

        return baseUrl ? (
          <MenuLink key={index} href={createPageUrl(page as number)} className={className}>
            {page}
          </MenuLink>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange?.(page as number)}
            className={className}
            disabled={isActive}
          >
            {page}
          </button>
        );
      })}

      {/* Next button - optimized */}
      {baseUrl ? (
        <MenuLink
          href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md border pagination-button',
            currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
          )}
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </MenuLink>
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border pagination-button disabled:opacity-50"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
