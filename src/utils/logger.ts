/**
 * Logger utility to control debug logging throughout the application
 */

// Set to true to enable debug logs, false to disable
const DEBUG_MODE = process.env.NODE_ENV !== 'production';

/**
 * Logger utility with methods that can be toggled on/off
 */
export const logger = {
  /**
   * Log debug information (only in debug mode)
   */
  debug: (...args: unknown[]): void => {
    if (DEBUG_MODE) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always shown)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * Log warnings (always shown)
   */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },

  /**
   * Log info (always shown)
   */
  info: (...args: unknown[]): void => {
    console.info(...args);
  },
};
