// Menu configuration for phimapi.com
import { Category, Country } from '@/types';

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
export function getCategoriesMenuItem(
  categories: Category[]
): MenuItem {
  console.log('[DEBUG] Creating categories menu with categories:', categories);
  return {
    id: 'categories',
    label: 'Thể loại',
    href: '#categories',
    isDropdown: true,
    children: categories.map((category: Category) => {
      console.log('[DEBUG] Category item:', category);
      return {
        id: category.id || category.slug,
        label: category.name,
        href: `/the-loai/${category.slug}`,
      };
    }),
  };
}

// Create countries menu item from API data
export function getCountriesMenuItem(
  countries: Country[]
): MenuItem {
  console.log('[DEBUG] Creating countries menu with countries:', countries);
  return {
    id: 'countries',
    label: 'Quốc gia',
    href: '#countries',
    isDropdown: true,
    children: countries.map((country: Country) => {
      console.log('[DEBUG] Country item:', country);
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
export function getAllMenuItems(
  categories?: Category[],
  countries?: Country[]
): MenuItem[] {
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
