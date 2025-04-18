/**
 * Pagination configuration
 */
export interface IPaginationConfig {
  DEFAULT_PAGE: number;
  ITEMS_PER_PAGE: number;
  ITEMS_PER_API_PAGE: number;
  MAX_PAGES_TO_SHOW: number;
}

/**
 * Site configuration
 */
export interface ISiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
}

/**
 * Navigation item
 */
export interface INavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
}

/**
 * Navigation menu
 */
export interface INavMenu {
  title: string;
  items: INavItem[];
}

/**
 * Main navigation
 */
export interface IMainNav {
  mainNav: INavItem[];
  sidebarNav: INavMenu[];
}
