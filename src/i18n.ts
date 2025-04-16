import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n/config';

export default getRequestConfig(async ({ locale: paramLocale }) => {
  // Use param locale if it exists and is valid, otherwise use default
  const locale = paramLocale && locales.includes(paramLocale as any)
    ? paramLocale
    : defaultLocale;

  return {
    locale,
    messages: (await import(`./i18n/locales/${locale}.json`)).default
  };
});
