'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import { getCategories } from '@/services/phimapi';
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import { Movie, PaginatedResponse } from '@/types';
import { MovieCard } from '@/components/movie/movie-card';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { BackToTop } from '@/components/ui/back-to-top';
import { InternalLinks } from '@/components/ui/internal-links';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { clientCache } from '@/lib/cache/client-cache';
import { FeaturedCountriesSection } from '@/components/movie/featured-countries-section';
import { FeaturedCountriesSkeleton } from '@/components/movie/featured-countries-skeleton';
import { HERO_CAROUSEL_ITEMS } from '@/lib/constants';

interface HomeClientPageProps {
  initialCountriesData?: {
    slug: string;
    name: string;
    movies: Movie[];
  }[];
}

export default function HomeClientPage({ initialCountriesData = [] }: HomeClientPageProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [popularTopics, setPopularTopics] = useState<Array<{ name: string; url: string }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Theo dõi các trang đã được fetch hoặc đang fetch
  const fetchedPagesRef = useRef<Set<number>>(new Set([1])); // Trang 1 luôn được fetch đầu tiên
  const pendingFetchesRef = useRef<Set<number>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    page,
    setIsLoading: setScrollLoading,
    hasMore,
    setHasMore,
  } = useInfiniteScroll(containerRef, { threshold: 300 });

  // Function to fetch movies with caching using Batch API
  const fetchMoviesWithCache = useCallback(async (page: number) => {
    const cacheKey = `movies_page_${page}`;

    // Kiểm tra cache trước
    const cachedData = clientCache.get<PaginatedResponse<Movie>>(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for page ${page}`);
      fetchedPagesRef.current.add(page);
      return cachedData;
    }

    // Kiểm tra xem trang này đang được fetch chưa
    if (pendingFetchesRef.current.has(page)) {
      console.log(`Page ${page} is already being fetched, waiting...`);
      // Đợi cho đến khi fetch hoàn tất
      let attempts = 0;
      while (pendingFetchesRef.current.has(page) && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      // Thử lấy lại từ cache sau khi đợi
      const dataAfterWait = clientCache.get<PaginatedResponse<Movie>>(cacheKey);
      if (dataAfterWait) {
        return dataAfterWait;
      }
    }

    // Đánh dấu trang này đang được fetch
    pendingFetchesRef.current.add(page);

    try {
      console.log(`Fetching fresh data for page ${page} using Batch API`);

      // Add a small delay to show loading indicator (only for visual feedback)
      if (page > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Sử dụng Batch API thay vì gọi trực tiếp
      const batchUrl = `/api/batch?resources=new_movies&page=${page}`;
      const response = await fetch(batchUrl);

      if (!response.ok) {
        throw new Error(`Batch API responded with status: ${response.status}`);
      }

      const batchData = await response.json();
      const moviesData = batchData.newMovies;

      // Kiểm tra xem response có hợp lệ không
      if (!moviesData || !moviesData.data || !Array.isArray(moviesData.data)) {
        console.error(`Invalid response from Batch API for page ${page}:`, batchData);
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
            currentPage: page,
            totalPages: 1
          }
        };
      }

      // Cache for 5 minutes
      clientCache.set(cacheKey, moviesData, 5 * 60 * 1000);

      // Đánh dấu trang này đã được fetch
      fetchedPagesRef.current.add(page);

      return moviesData;
    } catch (error) {
      console.error(`Error fetching data for page ${page}:`, error);
      return {
        data: [],
        pagination: {
          totalItems: 0,
          totalItemsPerPage: PAGINATION_CONFIG.ITEMS_PER_PAGE,
          currentPage: page,
          totalPages: 1
        }
      };
    } finally {
      // Luôn xóa khỏi danh sách đang fetch, bất kể thành công hay thất bại
      pendingFetchesRef.current.delete(page);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch movies
        const response = await fetchMoviesWithCache(1);

        // Kiểm tra xem response có hợp lệ không
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.error('Invalid response for initial load:', response);
          setMovies([]);
        } else {
          setMovies(response.data);
        }

        // Fetch categories for topics
        const categories = await getCategories();

        // Danh sách thể loại ưu tiên
        const priorityGenres = [
          'Tình cảm',
          'Hành động',
          'Cổ trang',
          'Tâm lý',
          'Viễn tưởng',
          'Kinh dị',
        ];

        // Lọc ra các thể loại ưu tiên
        const priorityCategories: Array<{ name: string; url: string }> = [];

        // Thêm các thể loại ưu tiên theo thứ tự đã định
        for (const genreName of priorityGenres) {
          const found = categories.find(
            cat =>
              cat.name.toLowerCase() === genreName.toLowerCase() ||
              cat.name.toLowerCase().includes(genreName.toLowerCase())
          );

          if (found) {
            priorityCategories.push({
              name: found.name,
              url: `/the-loai/${found.slug}`,
            });
          }
        }

        // Nếu chưa đủ 6 thể loại, bổ sung thêm từ danh sách gốc
        const remainingCount = 6 - priorityCategories.length;
        if (remainingCount > 0) {
          const remainingCategories = categories
            .filter(cat => !priorityCategories.some(p => p.name === cat.name))
            .slice(0, remainingCount)
            .map(cat => ({
              name: cat.name,
              url: `/the-loai/${cat.slug}`,
            }));

          priorityCategories.push(...remainingCategories);
        }

        // Thêm một số chủ đề tìm kiếm phổ biến
        const searchTopics = [
          { name: 'Marvel', url: '/tim-kiem?keyword=marvel' },
          { name: '4K', url: '/tim-kiem?keyword=4k' },
          { name: 'Sitcom', url: '/tim-kiem?keyword=sitcom' },
          { name: 'Lồng Tiếng', url: '/danh-muc/phim-long-tieng' },
          { name: 'Xuyên Không', url: '/tim-kiem?keyword=xuyen-khong' },
          { name: 'Cổ Trang', url: '/tim-kiem?keyword=co-trang' },
        ];

        setPopularTopics([...priorityCategories, ...searchTopics]);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchMoviesWithCache]);

  // Prefetch next page
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Only prefetch if we're not loading and initial load is complete
    if (initialLoadComplete && !isLoading) {
      const nextPage = page + 1;

      // Kiểm tra xem trang này đã được fetch hoặc đang fetch chưa
      if (!fetchedPagesRef.current.has(nextPage) && !pendingFetchesRef.current.has(nextPage)) {
        console.log(`Prefetching data for page ${nextPage}`);
        // Use setTimeout to avoid blocking the main thread
        timer = setTimeout(() => {
          fetchMoviesWithCache(nextPage).catch(err =>
            console.error(`Error prefetching page ${nextPage}:`, err)
          );
        }, 1000);
      } else {
        console.log(`Page ${nextPage} already fetched or being fetched, skipping prefetch`);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [page, isLoading, initialLoadComplete, fetchMoviesWithCache]);

  // Load more when scrolling
  useEffect(() => {
    if (page === 1 || !initialLoadComplete) return;

    const fetchMoreMovies = async () => {
      try {
        setScrollLoading(true);
        const response = await fetchMoviesWithCache(page);

        // Kiểm tra xem response có hợp lệ không
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.error('Invalid response for infinite scroll:', response);
          setScrollLoading(false);
          return;
        }

        const newMovies = response.data;

        if (newMovies.length === 0) {
          setHasMore(false);
          setScrollLoading(false);
          return;
        }

        setMovies(prevMovies => {
          // Lọc các phim trùng lặp dựa trên _id
          const existingIds = new Set(prevMovies.map((movie: Movie) => movie._id));
          const uniqueNewMovies = newMovies.filter((movie: Movie) => !existingIds.has(movie._id));
          return [...prevMovies, ...uniqueNewMovies];
        });

        // Check if we've reached the last page
        if (page >= response.pagination.totalPages) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching more movies:', error);
      } finally {
        setScrollLoading(false);
      }
    };

    fetchMoreMovies();
  }, [page, initialLoadComplete, setHasMore, setScrollLoading, fetchMoviesWithCache]);

  // Loading indicator
  const renderLoadingIndicator = () => {
    if (!hasMore) return null;

    return (
      <div className="flex justify-center py-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  };

  // Check if we have movies before trying to access them
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section Skeleton */}
        <section className="relative mb-12 overflow-hidden rounded-xl">
          <div className="relative aspect-video w-full animate-pulse bg-gray-800"></div>
        </section>

        {/* Featured Countries Skeleton */}
        <FeaturedCountriesSkeleton className="mt-8" />

        {/* Movies Grid Skeleton */}
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-800"></div>
        <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {Array(Math.floor(PAGINATION_CONFIG.ITEMS_PER_PAGE / 2))
            .fill(null)
            .map((_, index) => (
              <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-gray-800" />
            ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Không có phim nào</h1>
        <p className="mb-8 text-gray-400">Vui lòng thử lại sau hoặc kiểm tra kết nối của bạn.</p>
      </div>
    );
  }

  // Get the first few movies for the hero carousel based on configuration
  const heroMovies = movies.slice(0, HERO_CAROUSEL_ITEMS);

  return (
    <>
      <div className="container mx-auto px-4 py-8" ref={containerRef}>
        {/* SEO H1 heading - ẩn khỏi giao diện nhưng vẫn hiển thị cho search engines */}
        <h1 className="sr-only">
          Nextflix - Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD
        </h1>

        {/* Thêm nội dung văn bản cho SEO - ẩn khỏi giao diện nhưng vẫn hiển thị cho search engines */}
        <div className="sr-only">
          <p>
            Nextflix là trang web xem phim trực tuyến hàng đầu Việt Nam, cung cấp kho phim đa dạng
            với chất lượng HD. Tại đây, bạn có thể tìm thấy các bộ phim mới nhất, phim lẻ, phim bộ,
            phim hoạt hình, phim chiếu rạp và các chương trình truyền hình được cập nhật liên tục.
          </p>
          <p>
            Với giao diện thân thiện, dễ sử dụng, Nextflix giúp bạn dễ dàng tìm kiếm và thưởng thức
            các bộ phim yêu thích. Chúng tôi cung cấp nhiều thể loại phim đa dạng từ hành động, tình
            cảm, hài hước, kinh dị, viễn tưởng đến phim hoạt hình và tài liệu.
          </p>
          <p>
            Tất cả các phim trên Nextflix đều được cung cấp với phụ đề tiếng Việt hoặc thuyết minh
            chất lượng cao, giúp bạn có trải nghiệm xem phim tuyệt vời nhất. Hãy khám phá kho tàng
            phim phong phú của chúng tôi ngay hôm nay!
          </p>
        </div>

        {/* Hero Carousel Section */}
        {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} title="" />}

        {/* Liên kết nội bộ - Bạn đang quan tâm gì? */}
        <InternalLinks
          title="Bạn đang quan tâm gì?"
          allTopicsUrl="/chu-de"
          links={popularTopics}
          className="mt-8"
        />

        {/* Featured Countries Section */}
        <FeaturedCountriesSection className="mt-8" countriesData={initialCountriesData} />

        {/* New Movies Section */}
        <section className="py-6">
          <h2 className="mb-6 text-2xl font-bold">Phim mới</h2>
          <div className="grid grid-cols-2 gap-2 xs:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
            {movies.map((movie, index) => (
              <MovieCard key={`${movie._id}-${index}`} movie={movie} />
            ))}
          </div>

          {/* Loading indicator */}
          {renderLoadingIndicator()}
        </section>
      </div>

      {/* Back to Top Button */}
      <BackToTop threshold={500} />
    </>
  );
}
