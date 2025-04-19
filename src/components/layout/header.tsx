'use client';

import Link from 'next/link';
import { MenuLink } from '@/components/ui/menu-link';
import { useState, useRef, useEffect, memo } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { MenuItem } from '@/lib/menu/phimapi-menu';
import { fetchMenuData } from '@/lib/cache/api-cache';
import Image from 'next/image';
import { MenuSkeleton } from '@/components/ui/menu-skeleton';
import { clientCache, CACHE_DURATION } from '@/lib/cache/client-cache';
import { CACHE_CONFIG } from '@/lib/config/cache-config';
import { Category, Country } from '@/types';

// Sử dụng năm cố định để tránh lỗi hydration
const CURRENT_YEAR = 2024;

// Tạo menu cơ bản để hiển thị ngay từ đầu
const getFixedMenuItems = (): MenuItem[] => {
  return [
    // Trang chủ
    { id: 'home', label: 'Trang chủ', href: `/` },

    // Loại phim
    {
      id: 'movie-types',
      label: 'Loại phim',
      href: '#movie-types',
      isDropdown: true,
      children: [
        { id: 'phim-le', label: 'Phim lẻ', href: `/categories/phim-le` },
        { id: 'phim-bo', label: 'Phim bộ', href: `/categories/phim-bo` },
        { id: 'tv-shows', label: 'TV Shows', href: `/categories/tv-shows` },
        { id: 'hoat-hinh', label: 'Hoạt hình', href: `/categories/hoat-hinh` },
      ],
    },

    // Ngôn ngữ
    {
      id: 'languages',
      label: 'Ngôn ngữ',
      href: '#languages',
      isDropdown: true,
      children: [
        { id: 'phim-vietsub', label: 'Vietsub', href: `/categories/phim-vietsub` },
        { id: 'phim-thuyet-minh', label: 'Thuyết minh', href: `/categories/phim-thuyet-minh` },
        { id: 'phim-long-tieng', label: 'Lồng tiếng', href: `/categories/phim-long-tieng` },
      ],
    },

    // Thể loại (menu con sẽ load từ API)
    {
      id: 'categories',
      label: 'Thể loại',
      href: '#categories',
      isDropdown: true,
      children: [],
    },

    // Quốc gia (menu con sẽ load từ API)
    {
      id: 'countries',
      label: 'Quốc gia',
      href: '#countries',
      isDropdown: true,
      children: [],
    },

    // Năm - sử dụng năm cố định để tránh lỗi hydration
    {
      id: 'years',
      label: 'Năm',
      href: '#years',
      isDropdown: true,
      children: Array.from({ length: 10 }, (_, i) => {
        const year = CURRENT_YEAR - i;
        return {
          id: `year-${year}`,
          label: year.toString(),
          href: `/categories/${year}`,
        };
      }),
    },
  ];
};

// Tách MenuItems thành component riêng và memo
const MenuItems = memo(function MenuItems({
  items,
  openDropdown,
  setOpenDropdown,
  setIsMenuOpen,
}: {
  items: MenuItem[];
  openDropdown: string | null;
  setOpenDropdown: (value: string | null) => void;
  setIsMenuOpen: (value: boolean) => void;
}) {
  return (
    <ul className="flex space-x-8">
      {items.map(item => (
        <li key={item.id} className="relative">
          {item.isDropdown ? (
            <>
              <button
                onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                className="flex items-center text-gray-300 font-medium transition-colors hover:text-blue-500"
              >
                {item.label}
                <ChevronDown size={16} className="ml-1" />
              </button>
              {openDropdown === item.label && (
                <div
                  className={`absolute ${
                    item.id === 'categories' || item.id === 'countries'
                      ? 'left-1/2 -translate-x-1/2 w-[600px]'
                      : 'left-0 w-48'
                  } top-full z-50 mt-2 rounded-md bg-black/90 py-3 px-4 shadow-lg`}
                >
                  {item.id === 'categories' || item.id === 'countries' ? (
                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-center">
                      {item.children?.map(child => (
                        <MenuLink
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-gray-300 font-medium hover:text-blue-500 transition-colors text-center mx-auto"
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          {child.label}
                        </MenuLink>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {item.children?.map(child => (
                        <MenuLink
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-gray-300 font-medium hover:text-blue-500 transition-colors"
                          onClick={() => {
                            setOpenDropdown(null);
                            setIsMenuOpen(false);
                          }}
                        >
                          {child.label}
                        </MenuLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <MenuLink
              href={item.href}
              className="text-gray-300 font-medium transition-colors hover:text-blue-500"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </MenuLink>
          )}
        </li>
      ))}
    </ul>
  );
});

export function Header() {
  const [menuState, setMenuState] = useState({
    items: getFixedMenuItems(),
    isLoading: false,
    error: null as string | null,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch menu data with improved error handling and loading states
  useEffect(() => {
    let mounted = true;

    const loadMenuData = async () => {
      // Check if we have cached menu data
      const cachedMenu = clientCache.get<MenuItem[]>('full_menu');
      if (cachedMenu) {
        setMenuState(prev => ({
          ...prev,
          items: cachedMenu,
          isLoading: false,
        }));
        return;
      }

      setMenuState(prev => ({ ...prev, isLoading: true }));
      try {
        // Use API calls
        const response = await fetchMenuData();
        const { categories = [], countries = [] } = response as {
          categories: Category[];
          countries: Country[];
        };

        if (!mounted) return;

        if (categories.length > 0 && countries.length > 0) {
          // Sử dụng callback trong setMenuState để tránh phụ thuộc vào menuState.items
          setMenuState(prev => {
            const updatedItems = [...prev.items];

            // Update categories
            const categoryIndex = updatedItems.findIndex(item => item.id === 'categories');
            if (categoryIndex !== -1) {
              updatedItems[categoryIndex] = {
                ...updatedItems[categoryIndex],
                children: categories.map(category => ({
                  id: category.id || category.slug,
                  label: category.name,
                  href: `/genres/${category.slug}`,
                })),
              };
            }

            // Update countries
            const countryIndex = updatedItems.findIndex(item => item.id === 'countries');
            if (countryIndex !== -1) {
              updatedItems[countryIndex] = {
                ...updatedItems[countryIndex],
                children: countries.map(country => ({
                  id: country.id || country.slug,
                  label: country.name,
                  href: `/countries/${country.slug}`,
                })),
              };
            }

            // Cache the full menu with longer duration
            clientCache.set('full_menu', updatedItems, CACHE_CONFIG.CLIENT.NAVIGATION);

            return {
              items: updatedItems,
              isLoading: false,
              error: null,
            };
          });

          // Cache is already set above
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        if (!mounted) return;

        // Fallback to original fetchMenuData if batch fails
        try {
          const response = await fetchMenuData();
          const { categories = [], countries = [] } = response as {
            categories: Category[];
            countries: Country[];
          };

          if (!mounted) return;

          if (categories.length > 0 && countries.length > 0) {
            setMenuState(prev => {
              const updatedItems = [...prev.items];

              // Update categories
              const categoryIndex = updatedItems.findIndex(item => item.id === 'categories');
              if (categoryIndex !== -1) {
                updatedItems[categoryIndex] = {
                  ...updatedItems[categoryIndex],
                  children: categories.map(category => ({
                    id: category.id || category.slug,
                    label: category.name,
                    href: `/genres/${category.slug}`,
                  })),
                };
              }

              // Update countries
              const countryIndex = updatedItems.findIndex(item => item.id === 'countries');
              if (countryIndex !== -1) {
                updatedItems[countryIndex] = {
                  ...updatedItems[countryIndex],
                  children: countries.map(country => ({
                    id: country.id || country.slug,
                    label: country.name,
                    href: `/countries/${country.slug}`,
                  })),
                };
              }

              // Cache the full menu
              clientCache.set('full_menu', updatedItems, CACHE_DURATION.MENU);

              return {
                items: updatedItems,
                isLoading: false,
                error: null,
              };
            });
          }
        } catch (fallbackError) {
          if (!mounted) return;

          setMenuState(prev => ({
            ...prev,
            isLoading: false,
            error: `Failed to load menu data: ${fallbackError}`,
          }));
        }
      }
    };

    loadMenuData();

    return () => {
      mounted = false;
    };
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
          <Link href="/" className="flex items-center">
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
            {menuState.isLoading ? (
              <MenuSkeleton />
            ) : menuState.error ? (
              <div className="text-red-500">{menuState.error}</div>
            ) : (
              <MenuItems
                items={menuState.items}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                setIsMenuOpen={setIsMenuOpen}
              />
            )}
          </nav>

          {/* Search and Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
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
            {menuState.isLoading ? (
              <MenuSkeleton />
            ) : menuState.error ? (
              <div className="text-red-500">{menuState.error}</div>
            ) : (
              <ul className="space-y-4">
                {menuState.items.map(item => (
                  <li key={item.id}>
                    {item.isDropdown ? (
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === item.label ? null : item.label)
                          }
                          className="flex items-center text-gray-300 font-medium transition-colors hover:text-blue-500"
                        >
                          {item.label}
                          <ChevronDown size={16} className="ml-1" />
                        </button>
                        {openDropdown === item.label && (
                          <div className="ml-4 border-l border-gray-700 pl-4">
                            {item.children?.map(child => (
                              <MenuLink
                                key={child.href}
                                href={child.href}
                                className="block py-2 text-sm text-gray-300 font-medium hover:text-blue-500 transition-colors"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setIsMenuOpen(false);
                                }}
                              >
                                {child.label}
                              </MenuLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <MenuLink
                        href={item.href}
                        className="block text-gray-300 font-medium transition-colors hover:text-blue-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </MenuLink>
                    )}
                  </li>
                ))}
              </ul>
            )}
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
