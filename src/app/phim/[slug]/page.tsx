import { getMovieDetail as apiGetMovieDetail } from '@/lib/api';
import { MovieDetail } from '@/types';
import Image from 'next/image';
import { MovieSchema } from '@/components/schema/movie-schema';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { MenuLink } from '@/components/ui/menu-link';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    return await apiGetMovieDetail(slug);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
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
        <MenuLink
          href="/"
          className="inline-block rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/80"
        >
          Về trang chủ
        </MenuLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Thêm Schema.org structured data */}
      <MovieSchema movie={movie} />
      <BreadcrumbSchema items={[{ name: movie.name, url: `/phim/${movie.slug}` }]} />

      {/* Movie info */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        {/* Movie poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <Image
              src={movie.poster_url || movie.thumb_url}
              alt={movie.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              priority
            />
          </div>

          {/* Nút Xem Phim */}
          <div className="mt-4">
            <MenuLink href={`/xem/${movie.slug}`} className="w-full">
              <Button
                className="w-full flex items-center justify-center gap-2 py-6 text-lg"
                size="lg"
              >
                <Play size={20} fill="white" />
                Xem Phim
              </Button>
            </MenuLink>
          </div>
        </div>

        {/* Movie details */}
        <div className="flex-1">
          <h1 className="mb-1 text-2xl font-bold md:text-3xl lg:text-4xl">{movie.name}</h1>
          <p className="mb-4 text-lg text-gray-400">{movie.origin_name}</p>

          {/* Movie metadata */}
          <div className="mb-6 grid grid-cols-2 gap-y-2 md:grid-cols-3">
            <p>
              <span className="font-semibold">Năm phát hành:</span> {movie.year}
            </p>
            <p>
              <span className="font-semibold">Thời lượng:</span> {movie.time || 'Chưa cập nhật'}
            </p>
            <p>
              <span className="font-semibold">Chất lượng:</span> {movie.quality}
            </p>
            <p>
              <span className="font-semibold">Ngôn ngữ:</span> {movie.lang}
            </p>
            <p>
              <span className="font-semibold">Trạng thái:</span>{' '}
              {movie.episode_current ? `${movie.episode_current}` : 'Hoàn thành'}
            </p>
            <p>
              <span className="font-semibold">Lượt xem:</span> {movie.view?.toLocaleString() || 0}
            </p>
          </div>

          {/* Genres */}
          <div className="mb-4">
            <p className="mb-2 font-semibold">Thể loại:</p>
            <div className="flex flex-wrap gap-2">
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.map(genre => (
                  <MenuLink
                    key={genre.slug}
                    href={`/the-loai/${genre.slug}`}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm hover:bg-gray-700"
                  >
                    {genre.name}
                  </MenuLink>
                ))
              ) : (
                <span className="text-gray-400">Chưa cập nhật</span>
              )}
            </div>
          </div>

          {/* Actors */}
          <div className="mb-4">
            <p className="mb-2 font-semibold">Diễn viên:</p>
            <p className="text-gray-300">
              {movie.actor && movie.actor.length > 0 ? movie.actor.join(', ') : 'Chưa cập nhật'}
            </p>
          </div>

          {/* Directors */}
          <div className="mb-4">
            <p className="mb-2 font-semibold">Đạo diễn:</p>
            <p className="text-gray-300">
              {movie.director && movie.director.length > 0
                ? movie.director.join(', ')
                : 'Chưa cập nhật'}
            </p>
          </div>

          {/* Countries */}
          <div className="mb-4">
            <p className="mb-2 font-semibold">Quốc gia:</p>
            <div className="flex flex-wrap gap-2">
              {movie.country?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movie.country.map(country => (
                    <MenuLink
                      key={country.slug}
                      href={`/quoc-gia/${country.slug}`}
                      className="rounded-full bg-gray-800 px-3 py-1 text-sm hover:bg-gray-700"
                    >
                      {country.name}
                    </MenuLink>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Chưa cập nhật</span>
              )}
            </div>
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

      {/* Trailer */}
      {movie.trailer_url && (
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-semibold">Trailer</h3>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <iframe
              src={movie.trailer_url}
              title={`Trailer ${movie.name}`}
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
