/**
 * API cache utility for common API calls
 * This helps reduce API calls by caching responses
 */

import { clientCache, memoize } from './client-cache';
import { getCategories, getCountries } from '@/services/phimapi';

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
  getCategories: memoize(
    getCategories,
    () => 'categories',
    CACHE_TIMES.CATEGORIES
  ),

  // Get countries with caching
  getCountries: memoize(
    getCountries,
    () => 'countries',
    CACHE_TIMES.COUNTRIES
  ),
};

/**
 * Fetch multiple API calls in parallel with caching
 * @returns Object with categories and countries
 */
export async function fetchMenuData() {
  try {
    // Check if we have cached data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedCategories = clientCache.get<any[]>('categories');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cachedCountries = clientCache.get<any[]>('countries');

    // If both are cached, return them immediately
    if (cachedCategories && cachedCountries) {
      console.log('Using cached menu data');
      return {
        categories: cachedCategories,
        countries: cachedCountries,
      };
    }

    console.log('Fetching fresh menu data');
    // Otherwise fetch them in parallel
    const [categories, countries] = await Promise.all([
      cachedAPI.getCategories(),
      cachedAPI.getCountries(),
    ]);

    // Cache the results for future use
    if (categories?.length > 0) {
      clientCache.set('categories', categories, CACHE_TIMES.CATEGORIES);
    }

    if (countries?.length > 0) {
      clientCache.set('countries', countries, CACHE_TIMES.COUNTRIES);
    }

    return { categories, countries };
  } catch (error) {
    console.error('Error fetching menu data:', error);
    // Return empty arrays as fallback
    return {
      categories: [],
      countries: [],
    };
  }
}
