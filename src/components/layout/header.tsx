'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LanguageSwitcher } from './language-switcher';
import { getCategories, getCountries } from '@/services/phimapi';
import { Category, Country } from '@/types';
import Image from 'next/image';
import { getAllMenuItems } from '@/lib/menu/phimapi-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch categories and countries
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getCountries(),
        ]);
        setCategories(categoriesData);
        setCountries(countriesData);

        // Generate menu items
        const items = getAllMenuItems(locale as any, categoriesData, countriesData);
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Use the menu items from phimapi-menu.ts

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center cursor-pointer">
            <Image
              src="/images/logo.png"
              alt="Nextflix"
              width={500}
              height={140}
              priority
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" ref={dropdownRef}>
            <ul className="flex space-x-8">
              {menuItems.map(item => (
                <li key={item.id} className="relative">
                  {item.isDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === item.label ? null : item.label)
                        }
                        className="flex items-center text-gray-300 transition-colors hover:text-blue-500"
                      >
                        {item.label}
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                      {openDropdown === item.label && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-md bg-black/90 py-1 shadow-lg">
                          {item.children?.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-blue-500 hover:text-white"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-gray-300 transition-colors hover:text-blue-500"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Search and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder={t('common.searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-64 rounded-full bg-gray-800 px-4 py-2 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-gray-400"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 bg-black/95 px-4 py-4 shadow-lg md:hidden">
          <nav className="mb-4">
            <div className="mb-4">
              <LanguageSwitcher />
            </div>
            <ul className="space-y-4">
              {menuItems.map(item => (
                <li key={item.id}>
                  {item.isDropdown ? (
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === item.label ? null : item.label)
                        }
                        className="flex items-center text-gray-300 transition-colors hover:text-blue-500"
                      >
                        {item.label}
                        <ChevronDown size={16} className="ml-1" />
                      </button>
                      {openDropdown === item.label && (
                        <div className="ml-4 space-y-2 border-l border-gray-700 pl-4">
                          {item.children?.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block text-sm text-gray-400 hover:text-blue-500"
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsMenuOpen(false);
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block text-gray-300 transition-colors hover:text-blue-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-gray-800 px-4 py-2 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-gray-400"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
