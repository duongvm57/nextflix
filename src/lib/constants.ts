// Đọc domain từ biến môi trường
export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'https://nextflix.lol';

// Thông tin cơ bản về website từ biến môi trường
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Nextflix - Xem Phim HD Online, Phim Mới';
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  'Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD';
export const SITE_KEYWORDS =
  process.env.NEXT_PUBLIC_SITE_KEYWORDS ||
  'phim online, phim HD, phim lẻ, phim bộ, phim vietsub, phim thuyết minh, phim chiếu rạp';

// Social media
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@nextflix';
export const FACEBOOK_PAGE =
  process.env.NEXT_PUBLIC_FACEBOOK_PAGE || 'https://facebook.com/nextflix';

// API config từ biến môi trường
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://phimapi.com';
export const API_V1_BASE_URL =
  process.env.NEXT_PUBLIC_API_V1_BASE_URL || 'https://phimapi.com/v1/api';
