export const defaultLocale = 'vi';
export const locales = ['en', 'vi'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export function getLocaleDirection(_locale: Locale) {
  // All supported locales use left-to-right direction
  return 'ltr';
}

export function getTranslations(locale: string) {
  try {
    // Make sure locale is one of the supported locales
    const safeLocale = locales.includes(locale as Locale) ? locale : defaultLocale;

    // This is a synchronous import
    return require(`./locales/${safeLocale}.json`);
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to English
    return require('./locales/en.json');
  }
}
