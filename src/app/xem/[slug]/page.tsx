import { getMovieDetail as apiGetMovieDetail } from '@/lib/api';
import { MovieDetail } from '@/types';
import { MovieSchema } from '@/components/schema/movie-schema';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { MenuLink } from '@/components/ui/menu-link';
import dynamic from 'next/dynamic';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

// Sử dụng dynamic import để tránh lỗi hydration
const MoviePlayer = dynamic(
  () => import('@/components/player/movie-player').then(mod => mod.MoviePlayer),
  {
    ssr: true, // Vẫn render trên server
  }
);

async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    return await apiGetMovieDetail(slug);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
}

type Props = {
  params: { slug: string };
};

// Server component for the page
export default async function WatchMoviePage(props: Props) {
  // Use Promise.resolve to handle the params
  const params = await Promise.resolve(props.params);
  const slug = params.slug;
  const movie = await getMovieDetail(slug);

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Không tìm thấy phim</h1>
        <p className="mb-8 text-gray-400">Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <MenuLink
          href="/"
          className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/80"
        >
          Về trang chủ
        </MenuLink>
      </div>
    );
  }

  // Get initial episode
  const initialEpisode = movie.episodes?.[0]?.items?.[0] || undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Thêm Schema.org structured data */}
      <MovieSchema movie={movie} />
      <BreadcrumbSchema
        items={[
          { name: movie.name, url: `/phim/${movie.slug}` },
          { name: 'Xem phim', url: `/xem/${movie.slug}` },
        ]}
      />

      {/* Hiển thị thông tin cơ bản của phim */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MenuLink
            href={`/phim/${movie.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Thông tin phim</span>
          </MenuLink>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{movie.name}</h1>
        <p className="text-gray-400">
          {movie.origin_name} ({movie.year})
        </p>
      </div>

      {/* Video player and episode selection */}
      {movie.episodes && movie.episodes.length > 0 && (
        <MoviePlayer movie={movie} initialEpisode={initialEpisode} />
      )}
    </div>
  );
}
