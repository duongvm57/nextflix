import { movieService } from '@/lib/services/api';
import { MovieDetail } from '@/types';
import Image from 'next/image';
import { MoviePlayer } from '@/components/player/movie-player';
import { Metadata } from 'next';
import { DOMAIN } from '@/lib/constants';
import { MovieSchema } from '@/components/schema/movie-schema';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { MenuLink } from '@/components/ui/menu-link';

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
export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
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
      <BreadcrumbSchema items={[{ name: movie.name, url: `/watch/${movie.slug}` }]} />

      {/* Video player and episode selection */}
      {movie.episodes && movie.episodes.length > 0 && (
        <MoviePlayer movie={movie} initialEpisode={initialEpisode} />
      )}

      {/* Movie header with poster and basic info */}
      <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg md:col-span-1">
          <Image
            src={
              movie.poster_url || movie.thumb_url || 'https://placehold.co/300x450?text=No+Image'
            }
            alt={movie.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
            priority
          />
        </div>

        {/* Movie info */}
        <div className="md:col-span-2">
          <h1 className="mb-2 text-3xl font-bold">{movie.name}</h1>
          <h2 className="mb-4 text-xl text-gray-400">{movie.origin_name}</h2>

          <div className="mb-6 space-y-2">
            <p>
              <span className="font-semibold">Năm phát hành:</span> {movie.year}
            </p>
            <p>
              <span className="font-semibold">Thời lượng:</span>{' '}
              {movie.time || movie.duration || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Trạng thái:</span>{' '}
              {movie.status === 'ongoing' ? 'Đang chiếu' : 'Hoàn thành'}
            </p>
            <p>
              <span className="font-semibold">Chất lượng:</span> {movie.quality}
            </p>
            <p>
              <span className="font-semibold">Ngôn ngữ:</span> {movie.lang}
            </p>
            <p>
              <span className="font-semibold">Đạo diễn:</span>{' '}
              {movie.directors?.length > 0 ? movie.directors.join(', ') : 'Chưa cập nhật'}
            </p>
            <p>
              <span className="font-semibold">Diễn viên:</span>{' '}
              {movie.actors?.length > 0 ? movie.actors.join(', ') : 'Chưa cập nhật'}
            </p>
            <p>
              <span className="font-semibold">Thể loại:</span>{' '}
              {movie.genres?.length > 0
                ? (
                  <span className="inline">
                    {movie.genres.map((genre, index) => (
                      <span key={genre.slug} className="inline">
                        <MenuLink href={`/genres/${genre.slug}`} className="text-primary hover:underline inline">
                          {genre.name}
                        </MenuLink>
                        {index < movie.genres.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                )
                : 'Chưa cập nhật'}
            </p>
            <p>
              <span className="font-semibold">Quốc gia:</span>{' '}
              {movie.country?.length > 0
                ? (
                  <span className="inline">
                    {movie.country.map((country, index) => (
                      <span key={country.slug} className="inline">
                        <MenuLink
                          href={`/countries/${country.slug}`}
                          className="text-primary hover:underline inline"
                        >
                          {country.name}
                        </MenuLink>
                        {index < movie.country.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                )
                : 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      </div>

      {/* Movie description */}
      <div className="mb-8">
        <h3 className="mb-4 text-2xl font-semibold">Nội dung phim</h3>
        <div className="prose prose-invert max-w-none">
          <p>{movie.content}</p>
        </div>
      </div>

      {/* Trailer section */}
      {movie.trailer_url && (
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-semibold">Trailer</h3>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <iframe
              src={movie.trailer_url}
              title={`${movie.name} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
