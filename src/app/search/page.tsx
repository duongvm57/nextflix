import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Metadata } from 'next';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';

async function searchMovies(keyword: string, page: number = 1) {
  try {
    return await movieService.searchMovies(keyword, page);
  } catch (error) {
    console.error('Error searching movies:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

// Tạo metadata động cho trang tìm kiếm
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { keyword?: string };
}): Promise<Metadata> {
  const keyword = searchParams.keyword || '';

  let title;
  let description;

  if (keyword) {
    title = `Kết quả tìm kiếm cho "${keyword}" - ${SITE_NAME}`;
    description = `Xem các bộ phim liên quan đến từ khóa "${keyword}". Tổng hợp phim hay nhất, cập nhật mới nhất.`;
  } else {
    title = `Tìm kiếm phim - ${SITE_NAME}`;
    description = `Tìm kiếm phim lẻ, phim bộ, phim hoạt hình và các chương trình truyền hình yêu thích của bạn.`;
  }

  return {
    title,
    description,
    keywords: keyword
      ? `${keyword}, phim hay, phim online, phim HD, phim mới`
      : 'tìm kiếm phim, phim hay, phim online, phim HD',
    openGraph: {
      title,
      description,
      url: keyword ? `${DOMAIN}/search?keyword=${encodeURIComponent(keyword)}` : `${DOMAIN}/search`,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: keyword
        ? `${DOMAIN}/search?keyword=${encodeURIComponent(keyword)}`
        : `${DOMAIN}/search`,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { keyword?: string; page?: string };
}) {
  const keyword = searchParams.keyword || '';
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { data: movies, pagination } = keyword
    ? await searchMovies(keyword, page)
    : { data: [], pagination: null };

  // Redirect to the last page if current page is greater than total pages
  if (pagination && pagination.totalPages > 0 && page > pagination.totalPages) {
    return Response.redirect(`/search?keyword=${encodeURIComponent(keyword)}&page=${pagination.totalPages}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema
        items={[
          { name: 'Tìm kiếm', url: '/search' },
          ...(keyword
            ? [
                {
                  name: `Kết quả cho "${keyword}"`,
                  url: `/search?keyword=${encodeURIComponent(keyword)}`,
                },
              ]
            : []),
        ]}
      />
      <Breadcrumb
        items={[
          { name: 'Tìm kiếm', url: '/search' },
          ...(keyword
            ? [
                {
                  name: `Kết quả cho "${keyword}"`,
                  url: `/search?keyword=${encodeURIComponent(keyword)}`,
                },
              ]
            : []),
        ]}
        className="mt-4 mb-4"
      />
      <h1 className="mb-8 text-3xl font-bold">
        {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : 'Tìm kiếm phim'}
      </h1>

      {keyword ? (
        movies.length > 0 ? (
          <>
            <MovieGrid movies={movies} />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                baseUrl={`/search?keyword=${encodeURIComponent(keyword)}`}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-[40vh] items-center justify-center">
            <p className="text-xl text-gray-400">
              Không tìm thấy phim nào phù hợp với từ khóa &quot;{keyword}&quot;.
            </p>
          </div>
        )
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-xl text-gray-400">Nhập từ khóa để tìm kiếm phim.</p>
        </div>
      )}
    </div>
  );
}
