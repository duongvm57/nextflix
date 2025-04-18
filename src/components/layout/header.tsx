'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { getAllMenuItems, MenuItem } from '@/lib/menu/phimapi-menu';
import { getCategories, getCountries } from '@/services/phimapi';
import Image from 'next/image';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        // Fetch categories and countries from API
        const [categoriesData, countriesData] = await Promise.all([
          getCategories(),
          getCountries()
        ]);

        // Get menu items with categories and countries
        const items = getAllMenuItems(categoriesData, countriesData);
        setMenuItems(items);
      } catch (error) {
        console.error('Error getting menu items:', error);
        // Fallback to basic menu items
        const items = getAllMenuItems();
        setMenuItems(items);
      }
    }

    fetchMenuItems();
  }, []);

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
      router.push(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer">
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
                        <div className={`absolute ${item.id === 'categories' || item.id === 'countries' ? 'left-1/2 -translate-x-1/2 w-[600px]' : 'left-0 w-48'} top-full z-50 mt-2 rounded-md bg-black/90 py-3 px-4 shadow-lg`}>
                          {item.id === 'categories' || item.id === 'countries' ? (
                            <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-center">
                              {item.children?.map(child => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block py-2 text-sm text-gray-300 hover:text-blue-500 transition-colors text-center mx-auto"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div>
                              {item.children?.map(child => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block py-2 text-sm text-gray-300 hover:text-blue-500 transition-colors"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
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
            {/* Language switcher removed */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
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
            <div className="mb-4">{/* Language switcher removed */}</div>
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
                        <div className="ml-4 border-l border-gray-700 pl-4">
                          {item.id === 'categories' || item.id === 'countries' ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 py-2 text-center">
                              {item.children?.map(child => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="block text-sm text-gray-400 hover:text-blue-500 py-2 transition-colors text-center"
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setIsMenuOpen(false);
                                  }}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2 py-2">
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
              placeholder="Tìm kiếm phim..."
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
