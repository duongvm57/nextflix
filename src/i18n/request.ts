import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // If locale is undefined, use the default locale
  const safeLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`./locales/${safeLocale}.json`)).default,
  };
});
