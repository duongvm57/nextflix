/**
 * API cache utility for common API calls
 * This helps reduce API calls by caching responses
 */

import { clientCache, memoize } from './client-cache';
import { getCategories, getCountries } from '@/lib/api';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/config/cache-config';
import { Category, Country } from '@/types';
import { logger } from '@/utils/logger';
// Cache expiration times (in milliseconds)
const CACHE_TIMES = {
  // Categories and countries rarely change, cache for 1 hour
  CATEGORIES: 60 * 60 * 1000,
  COUNTRIES: 60 * 60 * 1000,
  // Movies change more frequently, cache for 5 minutes
  MOVIES: 5 * 60 * 1000,
};

// Memoized API functions
export const cachedAPI = {
  // Get categories with caching
  getCategories: memoize(getCategories, () => 'categories', CACHE_TIMES.CATEGORIES),

  // Get countries with caching
  getCountries: memoize(getCountries, () => 'countries', CACHE_TIMES.COUNTRIES),
};

/**
 * Fetch multiple API calls using batch API with caching
 * @returns Object with categories and countries
 */
export async function fetchMenuData(): Promise<{
  categories: Category[];
  countries: Country[];
}> {
  try {
    // Check memory and session storage cache first
    const cachedMenu = clientCache.get<{ categories: Category[]; countries: Country[] }>(
      CACHE_KEYS.MENU
    );
    if (cachedMenu) {
      logger.debug('[MENU] Using cached menu data');
      return cachedMenu;
    }

    logger.debug('[MENU] Fetching menu data from batch API');

    // Use batch API instead of parallel requests to reduce RSC requests
    const response = await fetch('/api/batch?resources=categories,countries', {
      cache: 'force-cache',
      next: { revalidate: CACHE_CONFIG.SERVER.MENU },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch batch data: ${response.status}`);
    }

    const data = await response.json();
    const { categories = [], countries = [] } = data;

    const menuData = {
      categories,
      countries,
    };

    // Cache the complete menu data
    if (
      Array.isArray(categories) &&
      Array.isArray(countries) &&
      categories.length > 0 &&
      countries.length > 0
    ) {
      logger.debug('[MENU] Caching menu data');
      clientCache.set(CACHE_KEYS.MENU, menuData, CACHE_CONFIG.CLIENT.MENU);
    }

    return {
      categories: (categories as Category[]) || [],
      countries: (countries as Country[]) || [],
    };
  } catch (error) {
    logger.error('[MENU] Error fetching menu data:', error);

    // Fallback to parallel requests if batch API fails
    try {
      logger.debug('[MENU] Falling back to parallel requests');
      const [categories, countries] = await Promise.all([getCategories(), getCountries()]);

      return {
        categories: (categories as Category[]) || [],
        countries: (countries as Country[]) || [],
      };
    } catch (fallbackError) {
      logger.error('[MENU] Fallback also failed:', fallbackError);
      return {
        categories: [],
        countries: [],
      };
    }
  }
}
