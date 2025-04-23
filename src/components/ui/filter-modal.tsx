'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TYPE_LIST } from '@/lib/api/constants';
import { useFilter } from '@/components/providers/filter-provider';
import { ApiParams } from '@/lib/api/client';
import { getCountries, getCategories } from '@/lib/api';
import { Country, Category } from '@/types';
import { clientCache } from '@/lib/cache/client-cache';
import { CACHE_KEYS } from '@/lib/config/cache-config';

interface FilterOption {
  name: string;
  value: string;
  selected?: boolean;
}

interface FilterGroup {
  title: string;
  options: FilterOption[];
  type: 'radio' | 'checkbox';
  param: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
  currentFilters?: Record<string, string | string[]>;
  currentRoute?: string; // Current route path to auto-select filters
}

export function FilterModal({ isOpen, onClose, baseUrl, currentFilters = {}, currentRoute }: FilterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // State for countries and categories from API
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch countries and categories from clientCache
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to get countries from clientCache first
        let countriesData = clientCache.get<Country[]>(CACHE_KEYS.COUNTRIES);

        // If not in cache, fetch from API
        if (!countriesData || countriesData.length === 0) {
          console.log('[FilterModal] Countries not found in cache, fetching from API');
          countriesData = await getCountries();
        } else {
          console.log('[FilterModal] Using countries from cache');
        }

        setCountries(countriesData || []);

        // Try to get categories from clientCache first
        let categoriesData = clientCache.get<Category[]>(CACHE_KEYS.CATEGORIES);

        // If not in cache, fetch from API
        if (!categoriesData || categoriesData.length === 0) {
          console.log('[FilterModal] Categories not found in cache, fetching from API');
          categoriesData = await getCategories();
        } else {
          console.log('[FilterModal] Using categories from cache');
        }

        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };

    fetchData();
  }, []);

  // Define filter groups
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
    {
      title: 'Quốc gia',
      param: 'country',
      type: 'radio',
      options: [
        { name: 'Tất cả', value: '' },
        { name: 'Việt Nam', value: 'viet-nam' },
        { name: 'Trung Quốc', value: 'trung-quoc' },
        { name: 'Thái Lan', value: 'thai-lan' },
        { name: 'Hồng Kông', value: 'hong-kong' },
        { name: 'Pháp', value: 'phap' },
        { name: 'Đức', value: 'duc' },
        { name: 'Hà Lan', value: 'ha-lan' },
        { name: 'Mexico', value: 'mexico' },
        { name: 'Thụy Điển', value: 'thuy-dien' },
        { name: 'Philippines', value: 'philippines' },
        { name: 'Đan Mạch', value: 'dan-mach' },
        { name: 'Thụy Sĩ', value: 'thuy-si' },
        { name: 'Ukraina', value: 'ukraina' },
        { name: 'Hàn Quốc', value: 'han-quoc' },
        { name: 'Âu Mỹ', value: 'au-my' },
        { name: 'Ấn Độ', value: 'an-do' },
        { name: 'Canada', value: 'canada' },
        { name: 'Tây Ban Nha', value: 'tay-ban-nha' },
        { name: 'Indonesia', value: 'indonesia' },
        { name: 'Ba Lan', value: 'ba-lan' },
        { name: 'Malaysia', value: 'malaysia' },
        { name: 'Bồ Đào Nha', value: 'bo-dao-nha' },
        { name: 'UAE', value: 'uae' },
        { name: 'Châu Phi', value: 'chau-phi' },
        { name: 'Ả Rập Xê Út', value: 'a-rap-xe-ut' },
        { name: 'Nhật Bản', value: 'nhat-ban' },
        { name: 'Đài Loan', value: 'dai-loan' },
        { name: 'Anh', value: 'anh' },
        { name: 'Quốc Gia Khác', value: 'quoc-gia-khac' },
        { name: 'Thổ Nhĩ Kỳ', value: 'tho-nhi-ky' },
        { name: 'Nga', value: 'nga' },
        { name: 'Úc', value: 'uc' },
        { name: 'Brazil', value: 'brazil' },
        { name: 'Ý', value: 'y' },
        { name: 'Na Uy', value: 'na-uy' },
        { name: 'Namh', value: 'namh' },
        { name: 'Kinh Điển', value: 'kinh-dien' },
      ],
    },
    {
      title: 'Loại phim',
      param: 'type',
      type: 'radio',
      options: [
        { name: 'Tất cả', value: '' },
        { name: 'Phim lẻ', value: TYPE_LIST.PHIM_LE },
        { name: 'Phim bộ', value: TYPE_LIST.PHIM_BO },
        { name: 'TV Shows', value: TYPE_LIST.TV_SHOWS },
        { name: 'Hoạt hình', value: TYPE_LIST.HOAT_HINH },
      ],
    },

    {
      title: 'Thể loại',
      param: 'category',
      type: 'radio',
      options: [
        { name: 'Tất cả', value: '' },
        { name: 'Anime', value: 'anime' },
        { name: 'Bí Ẩn', value: 'bi-an' },
        { name: 'Chiến Tranh', value: 'chien-tranh' },
        { name: 'Chiếu Rạp', value: 'chieu-rap' },
        { name: 'Chuyện Tình', value: 'chuyen-tinh' },
        { name: 'Chính Kịch', value: 'chinh-kich' },
        { name: 'Chính Luận', value: 'chinh-luan' },
        { name: 'Chính Trị', value: 'chinh-tri' },
        { name: 'Cổ Trang', value: 'co-trang' },
        { name: 'Cổ Tích', value: 'co-tich' },
        { name: 'Cờ Bạc', value: 'co-bac' },
        { name: 'Cung Đấu', value: 'cung-dau' },
        { name: 'Cuộc Tình', value: 'cuoc-tinh' },
        { name: 'Cách Mạng', value: 'cach-mang' },
        { name: 'Gia Đình', value: 'gia-dinh' },
        { name: 'Giang Sinh', value: 'giang-sinh' },
        { name: 'Hài', value: 'hai' },
        { name: 'Hành Động', value: 'hanh-dong' },
        { name: 'Hình Sự', value: 'hinh-su' },
        { name: 'Học Đường', value: 'hoc-duong' },
        { name: 'Kinh Dị', value: 'kinh-di' },
        { name: 'Lãng Mạn', value: 'lang-man' },
        { name: 'Lịch Sử', value: 'lich-su' },
        { name: 'Phiêu Lưu', value: 'phieu-luu' },
        { name: 'Tâm Lý', value: 'tam-ly' },
        { name: 'Tình Cảm', value: 'tinh-cam' },
        { name: 'Viễn Tưởng', value: 'vien-tuong' },
      ],
    },
    {
      title: 'Ngôn ngữ',
      param: 'sort_lang',
      type: 'radio',
      options: [
        { name: 'Tất cả', value: '' },
        { name: 'Phụ đề', value: 'vietsub' },
        { name: 'Thuyết minh', value: 'thuyet-minh' },
        { name: 'Lồng tiếng', value: 'long-tieng' },
      ],
    },
    {
      title: 'Năm sản xuất',
      param: 'year',
      type: 'radio',
      options: [
        { name: 'Tất cả', value: '' },
        { name: '2025', value: '2025' },
        { name: '2024', value: '2024' },
        { name: '2023', value: '2023' },
        { name: '2022', value: '2022' },
        { name: '2021', value: '2021' },
        { name: '2020', value: '2020' },
        { name: '2019', value: '2019' },
        { name: '2018', value: '2018' },
        { name: '2017', value: '2017' },
        { name: '2016', value: '2016' },
        { name: '2015', value: '2015' },
        { name: '2014', value: '2014' },
        { name: '2013', value: '2013' },
        { name: '2012', value: '2012' },
        { name: '2011', value: '2011' },
        { name: '2010', value: '2010' },
      ],
    },
    {
      title: 'Sắp xếp',
      param: 'sort_field',
      type: 'radio',
      options: [
        { name: 'Mới nhất', value: '_id' },
        { name: 'Mới cập nhật', value: 'modified.time' },
        { name: 'Năm phát hành', value: 'year' },
      ],
    },
    {
      title: 'Thứ tự',
      param: 'sort_type',
      type: 'radio',
      options: [
        { name: 'Giảm dần', value: 'desc' },
        { name: 'Tăng dần', value: 'asc' },
      ],
    },
  ]);

  // Update filter groups when countries or categories change
  useEffect(() => {
    if (countries.length > 0 || categories.length > 0) {
      setFilterGroups(prevGroups => {
        const updatedGroups = [...prevGroups];
        let hasChanges = false;

        // Update countries if available
        if (countries.length > 0) {
          const countryGroupIndex = updatedGroups.findIndex(group => group.param === 'country');

          if (countryGroupIndex !== -1) {
            // Create new options array with 'Tất cả' as first option
            const countryOptions = [
              { name: 'Tất cả', value: '', selected: true },
              ...countries.map(country => ({
                name: country.name,
                value: country.slug,
                selected: false
              }))
            ];

            // Update the country group with new options
            updatedGroups[countryGroupIndex] = {
              ...updatedGroups[countryGroupIndex],
              options: countryOptions
            };
            hasChanges = true;
          }
        }

        // Update categories if available
        if (categories.length > 0) {
          const categoryGroupIndex = updatedGroups.findIndex(group => group.param === 'category');

          if (categoryGroupIndex !== -1) {
            // Create new options array with 'Tất cả' as first option
            const categoryOptions = [
              { name: 'Tất cả', value: '', selected: true },
              ...categories.map(category => ({
                name: category.name,
                value: category.slug,
                selected: false
              }))
            ];

            // Update the category group with new options
            updatedGroups[categoryGroupIndex] = {
              ...updatedGroups[categoryGroupIndex],
              options: categoryOptions
            };
            hasChanges = true;
          }
        }

        // Return updated groups if there were changes, otherwise return previous groups
        return hasChanges ? updatedGroups : prevGroups;
      });
    }
  }, [countries, categories]);

  // Initialize selected options based on current filters and route
  useEffect(() => {
    console.log('Initializing filter options with currentFilters:', currentFilters);

    // Set default selection for all groups (select 'Tất cả' options)
    setFilterGroups(prevGroups => {
      return prevGroups.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          selected: option.value === '' // By default, select 'Tất cả' options
        }))
      }));
    });

    // Apply route-based auto-selection
    if (currentRoute) {
      setFilterGroups(prevGroups => {
        return prevGroups.map(group => {
          // Auto-select based on route
          if (group.param === 'sort_lang' && currentRoute.includes('/danh-muc/phim-thuyet-minh')) {
            return {
              ...group,
              options: group.options.map(option => ({
                ...option,
                selected: option.value === 'thuyet-minh'
              }))
            };
          }
          // Add more route-based selections as needed
          else if (group.param === 'sort_lang' && currentRoute.includes('/danh-muc/phim-vietsub')) {
            return {
              ...group,
              options: group.options.map(option => ({
                ...option,
                selected: option.value === 'vietsub'
              }))
            };
          }
          else if (group.param === 'sort_lang' && currentRoute.includes('/danh-muc/phim-long-tieng')) {
            return {
              ...group,
              options: group.options.map(option => ({
                ...option,
                selected: option.value === 'long-tieng'
              }))
            };
          }
          else if (group.param === 'type' && currentRoute.includes('/danh-muc/phim-bo')) {
            return {
              ...group,
              options: group.options.map(option => ({
                ...option,
                selected: option.value === TYPE_LIST.PHIM_BO
              }))
            };
          }
          else if (group.param === 'type' && currentRoute.includes('/danh-muc/phim-le')) {
            return {
              ...group,
              options: group.options.map(option => ({
                ...option,
                selected: option.value === TYPE_LIST.PHIM_LE
              }))
            };
          }
          return group;
        });
      });
    }

    // Then apply current filters if any (these will override route-based selections)
    if (currentFilters && Object.keys(currentFilters).length > 0) {
      setFilterGroups(prevGroups => {
        return prevGroups.map(group => {
          const currentValue = currentFilters[group.param];
          console.log(`Checking filter for ${group.param}:`, currentValue);

          if (!currentValue) return group; // Skip if no value for this param

          return {
            ...group,
            options: group.options.map(option => {
              const isSelected =
                currentValue === option.value ||
                (Array.isArray(currentValue) && currentValue.includes(option.value)) ||
                (!currentValue && option.value === '');

              console.log(`Option ${option.name} (${option.value}) for ${group.param}: ${isSelected ? 'selected' : 'not selected'}`);

              return {
                ...option,
                selected: isSelected
              };
            })
          };
        });
      });
    }
  }, [currentFilters, currentRoute]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle option selection
  const handleOptionSelect = (groupIndex: number, optionIndex: number) => {
    setFilterGroups(prevGroups => {
      const newGroups = [...prevGroups];
      const group = newGroups[groupIndex];

      if (group.type === 'radio') {
        // For radio buttons, only one option can be selected
        group.options = group.options.map((option, idx) => ({
          ...option,
          selected: idx === optionIndex
        }));
      } else {
        // For checkboxes, toggle the selected state
        group.options[optionIndex].selected = !group.options[optionIndex].selected;
      }

      return newGroups;
    });
  };

  // Sử dụng hook useFilter nếu có
  let filterContext = null;
  try {
    // Wrap in try-catch to handle case when FilterProvider is not available
    filterContext = useFilter();
  } catch (error) {
    // Silently ignore the error - we'll use the fallback approach
    console.log('FilterProvider not available, using fallback navigation');
  }
  const searchParams = useSearchParams();

  // Apply filters and navigate
  const applyFilters = () => {
    // Tạo object filters từ các tùy chọn đã chọn
    const filters: Partial<ApiParams> = {};

    console.log('Current filters from props:', currentFilters);

    // Lấy các tham số filter hiện tại từ props
    if (currentFilters) {
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (key !== 'page' && value) {
          console.log(`Loading filter from props: ${key}=${value}`);
          filters[key as keyof ApiParams] = value as string;
        }
      });
    }

    // Lấy các tham số filter hiện tại từ URL để đảm bảo có dữ liệu mới nhất
    if (searchParams) {
      // Các tham số filter có thể có
      const possibleParams = [
        'type', 'category', 'country', 'year',
        'sort_field', 'sort_type', 'sort_lang', 'limit'
      ];

      // Lấy các tham số filter từ URL
      possibleParams.forEach(param => {
        const value = searchParams.get(param);
        if (value) {
          console.log(`Loading filter from URL: ${param}=${value}`);
          filters[param as keyof ApiParams] = value;
        }
      });
    }

    console.log('Initial filters from props:', {...filters});

    // Thêm các tùy chọn đã chọn vào filters (ghi đè lên các giá trị hiện tại)
    filterGroups.forEach(group => {
      // Kiểm tra xem có option 'Tất cả' được chọn không
      const allOptionSelected = group.options.some(option => option.selected && option.value === '');

      // Nếu 'Tất cả' được chọn, xóa tham số này khỏi filters
      if (allOptionSelected) {
        console.log(`Removing ${group.param} filter because 'Tất cả' is selected`);
        delete filters[group.param as keyof ApiParams];
        return;
      }

      // Lấy các option được chọn (không phải 'Tất cả')
      const selectedOptions = group.options.filter(option => option.selected && option.value !== '');

      if (selectedOptions.length > 0) {
        if (group.type === 'radio') {
          // For radio buttons, use the first (and only) selected option
          console.log(`Setting ${group.param} filter to ${selectedOptions[0].value}`);
          filters[group.param as keyof ApiParams] = selectedOptions[0].value;
        } else {
          // For checkboxes, add multiple values (not implemented yet)
          // This would require special handling in the API
        }
      } else {
        // Nếu không có option nào được chọn, xóa tham số này
        console.log(`Removing ${group.param} filter because no option is selected`);
        delete filters[group.param as keyof ApiParams];
      }
    });

    console.log('Final filters after processing:', {...filters});

    // Log filters for debugging
    console.log('Applying filters:', filters);

    if (filterContext) {
      // Sử dụng hook useFilter nếu có
      console.log('Using FilterContext to apply filters');
      filterContext.applyFilters(filters);
      onClose();
    } else {
      // Fallback to traditional URL navigation
      console.log('Using traditional URL navigation for filters');

      // Lấy các tham số hiện tại từ URL
      const currentParams = new URLSearchParams(window.location.search);

      // Reset page về 1 khi thay đổi filter
      currentParams.set('page', '1');

      // Cập nhật hoặc xóa các tham số filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`Setting URL param ${key}=${value}`);
          currentParams.set(key, String(value));
        } else {
          // Xóa tham số nếu giá trị rỗng
          console.log(`Removing URL param ${key}`);
          currentParams.delete(key);
        }
      });

      // Navigate to the filtered URL
      const queryString = currentParams.toString();
      const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;
      console.log('Navigating to:', url);

      router.push(url);
      onClose();
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterGroups(prevGroups => {
      return prevGroups.map(group => ({
        ...group,
        options: group.options.map(option => ({
          ...option,
          selected: option.value === '' // Select only the "Tất cả" options
        }))
      }));
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative mx-4 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-black p-6 scrollbar-hide"
        style={{
          overscrollBehavior: 'contain',
          boxShadow: '0 0 15px rgba(220, 38, 38, 0.25), 0 0 30px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(220, 38, 38, 0.15)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="mb-6 flex items-center">
          <Filter size={20} className="mr-2 text-red-600" />
          <h2 className="text-xl font-bold text-white">Bộ lọc</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterGroups.map((group, groupIndex) => (
            <div key={group.param} className="mb-3">
              <h3 className="mb-1.5 font-semibold text-sm text-red-600">{group.title}:</h3>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((option, optionIndex) => (
                  <button
                    key={option.value}
                    onClick={() => handleOptionSelect(groupIndex, optionIndex)}
                    className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                      option.selected
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={resetFilters}
            className="rounded-md border border-gray-800 bg-transparent px-3 py-1.5 text-sm text-white hover:bg-gray-900"
          >
            Đặt lại
          </button>
          <button
            onClick={applyFilters}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          >
            Lọc kết quả
          </button>
        </div>
      </div>
    </div>
  );
}
