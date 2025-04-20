import { Metadata } from 'next';
import { DOMAIN } from '@/lib/constants';
import { getMovieDetail as apiGetMovieDetail } from '@/lib/api';
import { MovieDetail } from '@/types';

async function getMovieDetail(slug: string): Promise<MovieDetail | null> {
  try {
    return await apiGetMovieDetail(slug);
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

  // Lấy thông tin tập phim đầu tiên
  const firstEpisode = movie.episodes?.[0]?.items?.[0];
  const episodeName = firstEpisode?.name || '';

  // Tạo tiêu đề theo mẫu: Xem phim {movie.name} tập {name} {movie.language} {movie.quality}
  const title = `Xem phim ${movie.name} ${episodeName ? `tập ${episodeName}` : ''} ${movie.lang} ${movie.quality}`;

  // Tạo thông tin phim theo mẫu
  const movieInfo = `Thông tin phim: ${movie.name}|${movie.origin_name}|${movie.lang}|${movie.quality}|${movie.episode_current || 'Full'}|${movie.year}|${genres}`;
  const episodeInfo = episodeName ? `Thông tin tập: ${episodeName}` : '';

  return {
    title: title,
    description: `${description}\n${movieInfo}\n${episodeInfo}`,
    keywords: `${movie.name}, ${movie.origin_name}, ${genres}, ${actors}, phim online, xem phim HD`,
    openGraph: {
      title: `${movie.name} (${movie.origin_name}) - ${movie.year}`,
      description,
      url: `${DOMAIN}/xem/${slug}`,
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
      canonical: `${DOMAIN}/xem/${slug}`,
    },
  };
}
