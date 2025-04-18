import { movieService } from '@/lib/services/api';
import { MovieDetail } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    return await movieService.getMovieDetail(slug);
  } catch (error) {
    console.error('Error fetching movie detail:', error);
    return null;
  }
}

export default async function MovieDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const movie = await getMovieDetail(slug);

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold">Không tìm thấy phim</h1>
        <p className="mb-8 text-gray-400">Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/80">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
                ? movie.genres.map((genre, index) => (
                    <span key={genre.slug}>
                      <Link href={`/genres/${genre.slug}`} className="text-primary hover:underline">
                        {genre.name}
                      </Link>
                      {index < movie.genres.length - 1 ? ', ' : ''}
                    </span>
                  ))
                : 'Chưa cập nhật'}
            </p>
            <p>
              <span className="font-semibold">Quốc gia:</span>{' '}
              {movie.country?.length > 0
                ? movie.country.map((country, index) => (
                    <span key={country.slug}>
                      <Link
                        href={`/countries/${country.slug}`}
                        className="text-primary hover:underline"
                      >
                        {country.name}
                      </Link>
                      {index < movie.country.length - 1 ? ', ' : ''}
                    </span>
                  ))
                : 'Chưa cập nhật'}
            </p>
          </div>

          {/* Watch button */}
          <div className="mt-6">
            <button className="rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/80">
              Xem phim
            </button>
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

      {/* Episodes section for TV series */}
      {movie.type === 'tv_series' && movie.episodes && movie.episodes.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-2xl font-semibold">Danh sách tập</h3>
          <div className="space-y-4">
            {movie.episodes.map((server, serverIndex) => (
              <div key={serverIndex} className="rounded-lg bg-gray-800 p-4">
                <h4 className="mb-3 text-lg font-medium">{server.server_name}</h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {server.items.map((episode, episodeIndex) => (
                    <button
                      key={episodeIndex}
                      className="rounded bg-gray-700 px-3 py-2 text-center hover:bg-primary"
                    >
                      {episode.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
