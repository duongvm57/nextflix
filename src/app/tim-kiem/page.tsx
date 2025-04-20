import { movieService } from '@/lib/services/api';
import { MovieGrid } from '@/components/movie/movie-grid';
import { Pagination } from '@/components/ui/pagination';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

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
    return Response.redirect(
      `/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${pagination.totalPages}`
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSchema
        items={[
          { name: 'Tìm kiếm', url: '/tim-kiem' },
          ...(keyword
            ? [
                {
                  name: `Kết quả cho "${keyword}"`,
                  url: `/tim-kiem?keyword=${encodeURIComponent(keyword)}`,
                },
              ]
            : []),
        ]}
      />
      <Breadcrumb
        items={[
          { name: 'Tìm kiếm', url: '/tim-kiem' },
          ...(keyword
            ? [
                {
                  name: `Kết quả cho "${keyword}"`,
                  url: `/tim-kiem?keyword=${encodeURIComponent(keyword)}`,
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
                baseUrl={`/tim-kiem?keyword=${encodeURIComponent(keyword)}`}
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
