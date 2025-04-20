import { movieService } from '@/lib/services/api';
import { MovieDetail } from '@/types';
import { Metadata } from 'next';
import { DOMAIN } from '@/lib/constants';
import { MovieSchema } from '@/components/schema/movie-schema';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { MenuLink } from '@/components/ui/menu-link';
import dynamic from 'next/dynamic';

// Sử dụng dynamic import để tránh lỗi hydration
const MoviePlayer = dynamic(() => import('@/components/player/movie-player').then(mod => mod.MoviePlayer), {
  ssr: true, // Vẫn render trên server
});

async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    return await movieService.getMovieDetail(slug);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
}

// Tạo metadata động cho trang chi tiết phim
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const movie = await getMovieDetail(slug);

  if (!movie) {
    return {
      title: 'Không tìm thấy phim',
      description: 'Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    };
  }

  // Tạo mô tả ngắn gọn từ nội dung phim
  const description = movie.content
    ? movie.content.length > 160
      ? `${movie.content.substring(0, 157)}...`
      : movie.content
    : `Xem phim ${movie.name} (${movie.origin_name}) ${movie.year} online với chất lượng HD`;

  // Tạo danh sách thể loại
  const genres = movie.genres?.map(genre => genre.name).join(', ') || '';

  // Tạo danh sách diễn viên
  const actors = movie.actors?.join(', ') || '';

  return {
    title: `${movie.name} (${movie.origin_name}) - ${movie.year}`,
    description,
    keywords: `${movie.name}, ${movie.origin_name}, ${genres}, ${actors}, phim online, xem phim HD`,
    openGraph: {
      title: `${movie.name} (${movie.origin_name}) - ${movie.year}`,
      description,
      url: `${DOMAIN}/watch/${slug}`,
      siteName: 'Nextflix',
      images: [
        {
          url: movie.poster_url || movie.thumb_url || 'https://placehold.co/1200x630?text=No+Image',
          width: 1200,
          height: 630,
          alt: movie.name,
        },
      ],
      locale: 'vi_VN',
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${movie.name} (${movie.origin_name}) - ${movie.year}`,
      description,
      images: [
        movie.poster_url || movie.thumb_url || 'https://placehold.co/1200x630?text=No+Image',
      ],
    },
    alternates: {
      canonical: `${DOMAIN}/watch/${slug}`,
    },
  };
}

// Server component for the page
export default async function WatchMoviePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const movie = await getMovieDetail(slug);

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Không tìm thấy phim</h1>
        <p className="mb-8 text-gray-400">Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <MenuLink href="/" className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/80">
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
      <BreadcrumbSchema items={[
        { name: movie.name, url: `/movie/${movie.slug}` },
        { name: "Xem phim", url: `/watch/${movie.slug}` }
      ]} />

      {/* Hiển thị thông tin cơ bản của phim */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <MenuLink
            href={`/movie/${movie.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Thông tin phim</span>
          </MenuLink>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{movie.name}</h1>
        <p className="text-gray-400">{movie.origin_name} ({movie.year})</p>
      </div>

      {/* Video player and episode selection */}
      {movie.episodes && movie.episodes.length > 0 && (
        <MoviePlayer movie={movie} initialEpisode={initialEpisode} />
      )}


    </div>
  );
}
