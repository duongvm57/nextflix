const { locales, defaultLocale } = require('./src/i18n/config');

module.exports = {
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'as-needed'
};
