/**
 * Menu Configuration - Cấu hình menu cho ứng dụng
 *
 * File này chứa các hàm và cấu trúc dữ liệu để tạo menu cho ứng dụng.
 */

import { Category, Country } from '@/types';
import { TYPE_LIST } from '@/lib/api/constants';
import { logger } from '@/utils/logger';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  isDropdown?: boolean;
  children?: MenuItem[];
}

// Base menu items
export function getBaseMenuItems(): MenuItem[] {
  return [{ id: 'home', label: 'Trang chủ', href: `/` }];
}

// Movie type menu items
export function getMovieTypeMenuItems(): MenuItem {
  return {
    id: 'movie-types',
    label: 'Loại phim',
    href: '#movie-types',
    isDropdown: true,
    children: [
      {
        id: 'phim-le',
        label: 'Phim lẻ',
        href: `/danh-muc/${TYPE_LIST.PHIM_LE}`,
      },
      {
        id: 'phim-bo',
        label: 'Phim bộ',
        href: `/danh-muc/${TYPE_LIST.PHIM_BO}`,
      },
      {
        id: 'tv-shows',
        label: 'TV Shows',
        href: `/danh-muc/${TYPE_LIST.TV_SHOWS}`,
      },
      {
        id: 'hoat-hinh',
        label: 'Hoạt hình',
        href: `/danh-muc/${TYPE_LIST.HOAT_HINH}`,
      },
    ],
  };
}

// Language menu items
export function getLanguageMenuItems(): MenuItem {
  return {
    id: 'languages',
    label: 'Ngôn ngữ',
    href: '#languages',
    isDropdown: true,
    children: [
      {
        id: 'phim-vietsub',
        label: 'Vietsub',
        href: `/danh-muc/${TYPE_LIST.PHIM_VIETSUB}`,
      },
      {
        id: 'phim-thuyet-minh',
        label: 'Thuyết minh',
        href: `/danh-muc/${TYPE_LIST.PHIM_THUYET_MINH}`,
      },
      {
        id: 'phim-long-tieng',
        label: 'Lồng tiếng',
        href: `/danh-muc/${TYPE_LIST.PHIM_LONG_TIENG}`,
      },
    ],
  };
}

// Create categories menu item from API data
export function getCategoriesMenuItem(categories: Category[]): MenuItem {
  logger.debug('Creating categories menu with categories:', categories);
  return {
    id: 'categories',
    label: 'Thể loại',
    href: '#categories',
    isDropdown: true,
    children: categories.map((category: Category) => {
      logger.debug('Category item:', category);
      return {
        id: category.id || category.slug,
        label: category.name,
        href: `/the-loai/${category.slug}`,
      };
    }),
  };
}

// Create countries menu item from API data
export function getCountriesMenuItem(countries: Country[]): MenuItem {
  logger.debug('Creating countries menu with countries:', countries);
  return {
    id: 'countries',
    label: 'Quốc gia',
    href: '#countries',
    isDropdown: true,
    children: countries.map((country: Country) => {
      logger.debug('Country item:', country);
      return {
        id: country.id || country.slug,
        label: country.name,
        href: `/quoc-gia/${country.slug}`,
      };
    }),
  };
}

// Create years menu item
export function getYearsMenuItem(): MenuItem {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return {
    id: 'years',
    label: 'Năm',
    href: '#years',
    isDropdown: true,
    children: years.map((year: number) => ({
      id: `year-${year}`,
      label: year.toString(),
      href: `/danh-muc/${year}`,
    })),
  };
}

// Get all menu items
export function getAllMenuItems(categories?: Category[], countries?: Country[]): MenuItem[] {
  // If categories or countries are not provided, return only the static menu items
  if (!categories || !countries) {
    return [
      ...getBaseMenuItems(),
      getMovieTypeMenuItems(),
      getLanguageMenuItems(),
      getYearsMenuItem(),
    ];
  }

  // Return all menu items including dynamic ones
  return [
    ...getBaseMenuItems(),
    getMovieTypeMenuItems(),
    getLanguageMenuItems(),
    getCategoriesMenuItem(categories),
    getCountriesMenuItem(countries),
    getYearsMenuItem(),
  ];
}
