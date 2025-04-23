'use client';

import { useFilter } from '@/components/providers/filter-provider';
import { MovieGrid } from './movie-grid';
import { Pagination } from '../ui/pagination';
import { FilterButton } from '../ui/filter-button';
import { Skeleton } from '../ui/skeleton';
import { Movie, PaginatedResponse } from '@/types';

interface FilteredMovieGridProps {
  initialData?: PaginatedResponse<Movie>;
  title?: string;
  showFilter?: boolean;
}

export function FilteredMovieGrid({ initialData, title, showFilter = true }: FilteredMovieGridProps) {
  // Sử dụng hook useFilter
  const { movies, pagination, loading, error, changePage } = useFilter();

  // Sử dụng dữ liệu ban đầu nếu không có dữ liệu từ hook
  const displayMovies = movies.length > 0 ? movies : (initialData?.data || []);
  const displayPagination = pagination.totalItems > 0 ? pagination : (initialData?.pagination || {
    totalItems: 0,
    totalItemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
  });

  // Hiển thị skeleton khi đang loading
  if (loading) {
    return (
      <div className="space-y-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}

        {showFilter && (
          <div className="flex justify-between items-center">
            <div className="flex-1" />
            <FilterButton />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-[250px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="space-y-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}

        {showFilter && (
          <div className="flex justify-between items-center">
            <div className="flex-1" />
            <FilterButton />
          </div>
        )}

        <div className="p-6 text-center">
          <p className="text-red-500">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có kết quả
  if (displayMovies.length === 0) {
    return (
      <div className="space-y-6">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}

        {showFilter && (
          <div className="flex justify-between items-center">
            <div className="flex-1" />
            <FilterButton />
          </div>
        )}

        <div className="p-6 text-center">
          <p className="text-gray-400">Không tìm thấy phim phù hợp với bộ lọc đã chọn.</p>
        </div>
      </div>
    );
  }

  // Hiển thị danh sách phim
  return (
    <div className="space-y-6">
      {title && <h1 className="text-2xl font-bold">{title}</h1>}

      {showFilter && (
        <div className="flex justify-between items-center">
          <div className="flex-1" />
          <FilterButton />
        </div>
      )}

      <MovieGrid movies={displayMovies} />

      {displayPagination.totalPages > 1 && (
        <Pagination
          currentPage={displayPagination.currentPage}
          totalPages={displayPagination.totalPages}
          onPageChange={changePage}
        />
      )}
    </div>
  );
}
