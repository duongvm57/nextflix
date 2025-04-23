import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ApiParams } from '@/lib/api/client';
import { Movie, PaginatedResponse } from '@/types';

/**
 * Hook để lọc phim dựa trên route hiện tại và các tham số filter
 *
 * @param initialData Dữ liệu ban đầu (nếu có)
 */
export function useMovieFilter(initialData?: PaginatedResponse<Movie>) {
  // State để lưu trữ dữ liệu phim
  const [movies, setMovies] = useState<Movie[]>(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || {
    totalItems: 0,
    totalItemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
  });

  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks từ Next.js
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Phân tích pathname để lấy routeType và routeSlug
  const getRouteInfo = useCallback(() => {
    if (!pathname) return { routeType: '', routeSlug: '' };

    const parts = pathname.split('/').filter(Boolean);

    if (parts.length >= 2) {
      return {
        routeType: parts[0], // ví dụ: 'the-loai', 'quoc-gia', 'nam'
        routeSlug: parts[1]  // ví dụ: 'hanh-dong', 'my', '2023'
      };
    } else if (parts.length === 1 && parts[0] === 'tim-kiem') {
      return {
        routeType: 'tim-kiem',
        routeSlug: searchParams?.get('keyword') || ''
      };
    }

    return { routeType: '', routeSlug: '' };
  }, [pathname, searchParams]);

  // Hàm để lấy dữ liệu phim đã lọc
  const fetchFilteredMovies = useCallback(async (filters: Partial<ApiParams> = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const { routeType, routeSlug } = getRouteInfo();
      console.log('fetchFilteredMovies - Route info:', { routeType, routeSlug });

      // Xây dựng URL cho API filter
      const params = new URLSearchParams();
      params.append('routeType', routeType);
      params.append('routeSlug', routeSlug);
      params.append('page', page.toString());

      // Thêm các tham số filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Gọi API filter
      const apiUrl = `/api/movies/filter?${params.toString()}`;
      console.log('fetchFilteredMovies - Calling API:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error fetching filtered movies: ${response.status}`);
      }

      const data: PaginatedResponse<Movie> = await response.json();
      console.log('fetchFilteredMovies - API response:', data);

      // Cập nhật state
      setMovies(data.data || []);
      setPagination(data.pagination || {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: page,
        totalPages: 0,
      });

      return data;
    } catch (err) {
      console.error('fetchFilteredMovies - Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: 10,
          currentPage: page,
          totalPages: 0,
        },
      };
    } finally {
      setLoading(false);
    }
  }, [getRouteInfo]);

  // Hàm để áp dụng filter và cập nhật URL
  const applyFilters = useCallback((filters: Partial<ApiParams>, updateUrl = true) => {
    // Lấy trang hiện tại từ URL hoặc mặc định là 1
    const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1;

    console.log('useMovieFilter: applyFilters called with', filters);

    // Gọi API để lấy dữ liệu đã lọc
    fetchFilteredMovies(filters, 1); // Always use page 1 when applying new filters

    // Cập nhật URL nếu cần
    if (updateUrl) {
      // Lấy các tham số hiện tại từ URL
      const currentParams = new URLSearchParams(window.location.search);

      // Reset page về 1 khi thay đổi filter
      currentParams.set('page', '1');

      // Cập nhật hoặc xóa các tham số filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`Setting URL param ${key}=${value}`);
          currentParams.set(key, String(value));
        } else {
          // Xóa tham số nếu giá trị rỗng
          console.log(`Removing URL param ${key}`);
          currentParams.delete(key);
        }
      });

      // Cập nhật URL
      const newUrl = `${pathname}?${currentParams.toString()}`;
      console.log('useMovieFilter: Updating URL to', newUrl);

      router.push(newUrl);
    }
  }, [fetchFilteredMovies, pathname, router, searchParams]);

  // Hàm để thay đổi trang
  const changePage = useCallback((newPage: number) => {
    // Lấy các tham số filter hiện tại từ URL
    const currentFilters: Partial<ApiParams> = {};

    // Các tham số filter có thể có
    const possibleParams = [
      'type', 'category', 'country', 'year',
      'sort_field', 'sort_type', 'sort_lang', 'limit'
    ];

    // Lấy các tham số filter từ URL
    possibleParams.forEach(param => {
      const value = searchParams?.get(param);
      if (value) {
        currentFilters[param as keyof ApiParams] = value;
      }
    });

    console.log('changePage: Current filters from URL:', currentFilters);

    // Gọi API để lấy dữ liệu trang mới
    fetchFilteredMovies(currentFilters, newPage);

    // Lấy các tham số hiện tại từ URL
    const currentParams = new URLSearchParams(window.location.search);

    // Cập nhật số trang
    currentParams.set('page', newPage.toString());

    // Cập nhật URL
    const newUrl = `${pathname}?${currentParams.toString()}`;
    console.log('changePage: Updating URL to', newUrl);

    router.push(newUrl);
  }, [fetchFilteredMovies, pathname, router, searchParams]);

  // Khởi tạo dữ liệu khi component mount hoặc URL thay đổi
  useEffect(() => {
    // Nếu đã có dữ liệu ban đầu, không cần fetch lại
    if (initialData && !searchParams?.toString()) {
      setMovies(initialData.data || []);
      setPagination(initialData.pagination || {
        totalItems: 0,
        totalItemsPerPage: 10,
        currentPage: 1,
        totalPages: 0,
      });
      return;
    }

    // Lấy các tham số filter từ URL
    const filters: Partial<ApiParams> = {};
    const page = searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1;

    // Các tham số filter có thể có
    const possibleParams = [
      'type', 'category', 'country', 'year',
      'sort_field', 'sort_type', 'sort_lang', 'limit'
    ];

    // Lấy các tham số filter từ URL
    possibleParams.forEach(param => {
      const value = searchParams?.get(param);
      if (value) {
        filters[param as keyof ApiParams] = value;
      }
    });

    console.log('useMovieFilter: Initial load with filters from URL:', filters);

    // Gọi API để lấy dữ liệu đã lọc
    fetchFilteredMovies(filters, page);
  }, [fetchFilteredMovies, initialData, searchParams]);

  return {
    movies,
    pagination,
    loading,
    error,
    applyFilters,
    changePage,
    getRouteInfo,
  };
}
