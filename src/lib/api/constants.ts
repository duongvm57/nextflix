/**
 * API Constants - Các hằng số liên quan đến API
 *
 * File này chứa các hằng số được sử dụng trong các API calls.
 */

// API config từ biến môi trường
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://phimapi.com';
export const API_V1_BASE_URL =
  process.env.NEXT_PUBLIC_API_V1_BASE_URL || 'https://phimapi.com/v1/api';

// Type list options for API
export const TYPE_LIST = {
  // Danh sách phim
  PHIM_BO: 'phim-bo',
  PHIM_LE: 'phim-le',
  TV_SHOWS: 'tv-shows',
  HOAT_HINH: 'hoat-hinh',
  PHIM_VIETSUB: 'phim-vietsub',
  PHIM_THUYET_MINH: 'phim-thuyet-minh',
  PHIM_LONG_TIENG: 'phim-long-tieng',
};

// Sort field options
export const SORT_FIELD = {
  MODIFIED_TIME: 'modified.time',
  ID: '_id',
  YEAR: 'year',
};

// Sort type options
export const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc',
};

// Sort language options
export const SORT_LANG = {
  VIETSUB: 'vietsub',
  THUYET_MINH: 'thuyet-minh',
  LONG_TIENG: 'long-tieng',
};
