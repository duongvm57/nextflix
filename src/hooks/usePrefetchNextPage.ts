import { useEffect, useRef } from 'react';
import { clientCache } from '@/lib/cache/client-cache';

/**
 * Hook để tải trước dữ liệu trang tiếp theo
 * @param fetchFn Hàm để tải dữ liệu
 * @param currentPage Trang hiện tại
 * @param enabled Có bật prefetch hay không
 * @param cachePrefix Tiền tố cho cache key
 */
export function usePrefetchNextPage<T>(
  fetchFn: (page: number) => Promise<T>,
  currentPage: number,
  enabled: boolean = true,
  cachePrefix: string = 'page'
) {
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Chỉ prefetch khi enabled và không đang tải
    if (!enabled || isLoadingRef.current) return;

    const nextPage = currentPage + 1;
    const cacheKey = `${cachePrefix}_${nextPage}`;

    // Kiểm tra xem đã có dữ liệu trong cache chưa
    const cachedData = clientCache.get(cacheKey);
    if (cachedData) {
      console.log(`Next page ${nextPage} already cached`);
      return;
    }

    // Đánh dấu đang tải để tránh gọi nhiều lần
    isLoadingRef.current = true;

    // Prefetch dữ liệu trang tiếp theo
    const prefetchNextPage = async () => {
      try {
        console.log(`Prefetching data for page ${nextPage}`);
        const data = await fetchFn(nextPage);
        
        // Cache dữ liệu với thời gian 5 phút
        clientCache.set(cacheKey, data, 5 * 60 * 1000);
        console.log(`Cached data for page ${nextPage}`);
      } catch (error) {
        console.error(`Error prefetching page ${nextPage}:`, error);
      } finally {
        isLoadingRef.current = false;
      }
    };

    // Sử dụng setTimeout để không ảnh hưởng đến hiệu suất trang hiện tại
    const timer = setTimeout(() => {
      prefetchNextPage();
    }, 1000); // Đợi 1 giây sau khi trang hiện tại đã load xong

    return () => {
      clearTimeout(timer);
      isLoadingRef.current = false;
    };
  }, [fetchFn, currentPage, enabled, cachePrefix]);
}
