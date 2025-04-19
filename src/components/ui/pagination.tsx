import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
  onPageChange?: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, baseUrl, onPageChange }: PaginationProps) {
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
    <div className="flex items-center justify-center gap-2 py-8">
      {/* Previous button */}
      {baseUrl ? (
        <a
          href={currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : '#'}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md border',
            currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
          )}
        >
          <ChevronLeft size={16} />
          <span className="sr-only">Previous Page</span>
        </a>
      ) : (
        <Button
          variant="outline"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-10 w-10 p-0"
        >
          <ChevronLeft size={16} />
          <span className="sr-only">Previous Page</span>
        </Button>
      )}

      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          );
        }

        return baseUrl ? (
          <a
            key={`link-page-${page}-${index}`}
            href={`${baseUrl}?page=${page}`}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md',
              currentPage === page ? 'bg-blue-500 text-white' : 'border hover:bg-gray-100'
            )}
          >
            {page}
          </a>
        ) : (
          <Button
            key={`button-page-${page}-${index}`}
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange?.(page as number)}
            className={cn('h-10 w-10 p-0', currentPage === page && 'bg-blue-500 text-white')}
          >
            {page}
          </Button>
        );
      })}

      {/* Next button */}
      {baseUrl ? (
        <a
          href={currentPage < totalPages ? `${baseUrl}?page=${currentPage + 1}` : '#'}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-md border',
            currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
          )}
        >
          <ChevronRight size={16} />
          <span className="sr-only">Next Page</span>
        </a>
      ) : (
        <Button
          variant="outline"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-10 w-10 p-0"
        >
          <ChevronRight size={16} />
          <span className="sr-only">Next Page</span>
        </Button>
      )}
    </div>
  );
}
