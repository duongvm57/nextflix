'use client';

// No need for navigation imports with localePrefix: 'never'
import { localeNames, locales } from '@/i18n/config';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { useLocale } from 'next-intl';

// Language icon SVG component
const LanguageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    role="img"
    viewBox="0 0 16 16"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.7668 5.33333L10.5038 5.99715L9.33974 8.9355L8.76866 10.377L7.33333 14H9.10751L9.83505 12.0326H13.4217L14.162 14H16L12.5665 5.33333H10.8278H10.7668ZM10.6186 9.93479L10.3839 10.5632H11.1036H12.8856L11.6348 7.2136L10.6186 9.93479ZM9.52722 4.84224C9.55393 4.77481 9.58574 4.71045 9.62211 4.64954H6.41909V2H4.926V4.64954H0.540802V5.99715H4.31466C3.35062 7.79015 1.75173 9.51463 0 10.4283C0.329184 10.7138 0.811203 11.2391 1.04633 11.5931C2.55118 10.6795 3.90318 9.22912 4.926 7.57316V12.6667H6.41909V7.51606C6.81951 8.15256 7.26748 8.76169 7.7521 9.32292L8.31996 7.88955C7.80191 7.29052 7.34631 6.64699 6.9834 5.99715H9.06968L9.52722 4.84224Z"
      fill="white"
    />
  </svg>
);

export function LanguageSwitcher() {
  // We don't need pathname and router with localePrefix: 'never'
  const currentLocale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (locale: string) => {
    // Set the locale cookie with SameSite=Strict for security
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Strict`;

    // Close the dropdown
    setIsOpen(false);

    // Force a hard reload to apply the new locale
    // Use the current path but remove any locale prefix
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/(en|vi)(\/|$)/, '/');

    // Navigate to the path with the new locale
    window.location.href = `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}${window.location.search}`;

    // Prevent the default action
    return false;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center justify-between gap-1 px-3 py-2 rounded-full bg-black/50 border border-white/20 w-[160px] hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <span className="font-medium flex items-center whitespace-nowrap">
          <LanguageIcon /> <span className="ml-2">{localeNames[currentLocale as keyof typeof localeNames]}</span>
        </span>
        <span>▼</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[160px] rounded-2xl overflow-hidden shadow-lg border border-white/20">
          {/* Hiển thị tất cả ngôn ngữ, bao gồm cả ngôn ngữ hiện tại */}
          {locales.map((locale) => (
            <button
              key={locale}
              className={`block w-full px-4 py-3 text-center text-sm whitespace-nowrap ${
                locale === currentLocale
                  ? 'bg-blue-500 text-white font-medium hover:bg-blue-600'
                  : 'bg-white text-black hover:bg-gray-100 hover:text-blue-500'
              }`}
              onClick={() => handleLanguageChange(locale)}
            >
              {localeNames[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
