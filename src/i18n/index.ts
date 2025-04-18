import { defaultLocale } from './config';

// Re-export everything from config
export * from './config';

// Load messages directly
export const getMessages = async () => {
  return (await import(`./locales/${defaultLocale}.json`)).default;
};
