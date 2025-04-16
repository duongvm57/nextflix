import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './src/i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, use the default locale
  const safeLocale = locale && locales.includes(locale) ? locale : defaultLocale;
  
  return {
    messages: (await import(`./src/i18n/locales/${safeLocale}.json`)).default
  };
});
