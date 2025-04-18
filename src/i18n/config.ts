export const defaultLocale = 'vi';
export const locales = ['vi'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
};

export function getLocaleDirection() {
  // All supported locales use left-to-right direction
  return 'ltr';
}

export function getTranslations() {
  try {
    // Since we only have Vietnamese, always return Vietnamese translations
    // Use dynamic import instead of require
    return import('./locales/vi.json').then(module => module.default);
  } catch (error) {
    console.error(`Failed to load translations`, error);
    // Return empty object as fallback
    return {};
  }
}
