// Menu configuration for phimapi.com
import { Locale } from '@/i18n';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  isDropdown?: boolean;
  children?: MenuItem[];
}

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

// Base menu items
export function getBaseMenuItems(locale: Locale): MenuItem[] {
  return [
    { id: 'home', label: locale === 'en' ? 'Home' : 'Trang chủ', href: `/${locale}` },
  ];
}

// Movie type menu items
export function getMovieTypeMenuItems(locale: Locale): MenuItem {
  const label = locale === 'en' ? 'Movie Types' : 'Loại phim';

  return {
    id: 'movie-types',
    label,
    href: '#movie-types',
    isDropdown: true,
    children: [
      {
        id: 'phim-le',
        label: locale === 'en' ? 'Movies' : 'Phim lẻ',
        href: `/${locale}/danh-sach/${TYPE_LIST.PHIM_LE}`
      },
      {
        id: 'phim-bo',
        label: locale === 'en' ? 'TV Series' : 'Phim bộ',
        href: `/${locale}/danh-sach/${TYPE_LIST.PHIM_BO}`
      },
      {
        id: 'tv-shows',
        label: 'TV Shows',
        href: `/${locale}/danh-sach/${TYPE_LIST.TV_SHOWS}`
      },
      {
        id: 'hoat-hinh',
        label: locale === 'en' ? 'Animation' : 'Hoạt hình',
        href: `/${locale}/danh-sach/${TYPE_LIST.HOAT_HINH}`
      },
    ]
  };
}

// Language menu items
export function getLanguageMenuItems(locale: Locale): MenuItem {
  const label = locale === 'en' ? 'Languages' : 'Ngôn ngữ';

  return {
    id: 'languages',
    label,
    href: '#languages',
    isDropdown: true,
    children: [
      {
        id: 'phim-vietsub',
        label: 'Vietsub',
        href: `/${locale}/danh-sach/${TYPE_LIST.PHIM_VIETSUB}`
      },
      {
        id: 'phim-thuyet-minh',
        label: locale === 'en' ? 'Dubbed' : 'Thuyết minh',
        href: `/${locale}/danh-sach/${TYPE_LIST.PHIM_THUYET_MINH}`
      },
      {
        id: 'phim-long-tieng',
        label: locale === 'en' ? 'Voice Over' : 'Lồng tiếng',
        href: `/${locale}/danh-sach/${TYPE_LIST.PHIM_LONG_TIENG}`
      },
    ]
  };
}

// Create categories menu item from API data
export function getCategoriesMenuItem(locale: Locale, categories: any[]): MenuItem {
  console.log('[DEBUG] Creating categories menu with categories:', categories);
  return {
    id: 'categories',
    label: locale === 'en' ? 'Categories' : 'Thể loại',
    href: '#categories',
    isDropdown: true,
    children: categories.map(category => {
      console.log('[DEBUG] Category item:', category);
      return {
        id: category.id || category.slug,
        label: category.name,
        href: `/${locale}/the-loai/${category.slug}`
      };
    })
  };
}

// Create countries menu item from API data
export function getCountriesMenuItem(locale: Locale, countries: any[]): MenuItem {
  console.log('[DEBUG] Creating countries menu with countries:', countries);
  return {
    id: 'countries',
    label: locale === 'en' ? 'Countries' : 'Quốc gia',
    href: '#countries',
    isDropdown: true,
    children: countries.map(country => {
      console.log('[DEBUG] Country item:', country);
      return {
        id: country.id || country.slug,
        label: country.name,
        href: `/${locale}/quoc-gia/${country.slug}`
      };
    })
  };
}

// Create years menu item
export function getYearsMenuItem(locale: Locale): MenuItem {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return {
    id: 'years',
    label: locale === 'en' ? 'Years' : 'Năm',
    href: '#years',
    isDropdown: true,
    children: years.map(year => ({
      id: `year-${year}`,
      label: year.toString(),
      href: `/${locale}/danh-sach/${year}`
    }))
  };
}

// Get all menu items
export function getAllMenuItems(locale: Locale, categories: any[], countries: any[]): MenuItem[] {
  return [
    ...getBaseMenuItems(locale),
    getMovieTypeMenuItems(locale),
    getLanguageMenuItems(locale),
    getCategoriesMenuItem(locale, categories),
    getCountriesMenuItem(locale, countries),
    getYearsMenuItem(locale)
  ];
}
