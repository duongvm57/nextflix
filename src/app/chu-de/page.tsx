import { MenuLink } from '@/components/ui/menu-link';
import { getCategories, getCountries } from '@/services/phimapi';
import { TYPE_LIST } from '@/lib/menu/phimapi-menu';
import { Category, Country } from '@/types';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

// Predefined gradient colors for cards - dark monochrome with gradient from left to right
const gradients = [
  'from-gray-900/95 to-gray-800/95', // Darkest gray
  'from-gray-800/90 to-gray-700/90', // Dark gray
  'from-gray-700/85 to-gray-600/85', // Medium-dark gray
  'from-gray-600/80 to-gray-500/80', // Medium gray
  'from-gray-500/75 to-gray-400/75', // Medium-light gray
  'from-gray-400/70 to-gray-300/70', // Light gray
  'from-gray-300/65 to-gray-200/65', // Lightest gray
];

// Các chủ đề tìm kiếm phổ biến
const popularSearches = [
  { name: 'Marvel', url: '/tim-kiem?keyword=marvel' },
  { name: '4K', url: '/tim-kiem?keyword=4k' },
  { name: 'Sitcom', url: '/tim-kiem?keyword=sitcom' },
  { name: 'Xuyên Không', url: '/tim-kiem?keyword=xuyen-khong' },
  { name: 'Cổ Trang', url: '/tim-kiem?keyword=co-trang' },
  { name: 'Đình Nóc', url: '/tim-kiem?keyword=dinh-noc' },
  { name: '9x', url: '/tim-kiem?keyword=9x' },
  { name: 'Tham Vọng', url: '/tim-kiem?keyword=tham-vong' },
  { name: 'Chữa Lành', url: '/tim-kiem?keyword=chua-lanh' },
  { name: 'Phù Thủy', url: '/tim-kiem?keyword=phu-thuy' },
];

// Các loại phim
const movieTypes = [
  { name: 'Phim lẻ', url: `/danh-muc/${TYPE_LIST.PHIM_LE}` },
  { name: 'Phim bộ', url: `/danh-muc/${TYPE_LIST.PHIM_BO}` },
  { name: 'TV Shows', url: `/danh-muc/${TYPE_LIST.TV_SHOWS}` },
  { name: 'Hoạt hình', url: `/danh-muc/${TYPE_LIST.HOAT_HINH}` },
];

// Các ngôn ngữ
const languages = [
  { name: 'Vietsub', url: `/danh-muc/${TYPE_LIST.PHIM_VIETSUB}` },
  { name: 'Thuyết minh', url: `/danh-muc/${TYPE_LIST.PHIM_THUYET_MINH}` },
  { name: 'Lồng tiếng', url: `/danh-muc/${TYPE_LIST.PHIM_LONG_TIENG}` },
];

// Các năm gần đây
const recentYears = () => {
  // Sử dụng năm cố định để tránh lỗi hydration
  const currentYear = 2024;
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { name: year.toString(), url: `/danh-muc/${year}` };
  });
};

export default async function TopicsPage() {
  // Lấy danh sách thể loại và quốc gia từ API
  const [categories, countries] = await Promise.all([getCategories(), getCountries()]);

  // Chuyển đổi thể loại và quốc gia thành định dạng topic
  const genreTopics = categories.map((category: Category) => ({
    name: category.name,
    url: `/the-loai/${category.slug}`,
  }));

  const countryTopics = countries.map((country: Country) => ({
    name: country.name,
    url: `/quoc-gia/${country.slug}`,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Các chủ đề</h1>

      {/* Thể loại */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Thể loại</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {genreTopics.map((topic, index) => {
            const gradientClass = gradients[index % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>

      {/* Quốc gia */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Quốc gia</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {countryTopics.map((topic, index) => {
            const gradientClass = gradients[(index + 3) % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>

      {/* Loại phim */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Loại phim</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movieTypes.map((topic, index) => {
            const gradientClass = gradients[(index + 6) % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>

      {/* Ngôn ngữ */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Ngôn ngữ</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {languages.map((topic, index) => {
            const gradientClass = gradients[(index + 9) % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>

      {/* Năm */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Năm</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {recentYears().map((topic, index) => {
            const gradientClass = gradients[(index + 11) % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>

      {/* Tìm kiếm phổ biến */}
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">Tìm kiếm phổ biến</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {popularSearches.map((topic, index) => {
            const gradientClass = gradients[(index + 2) % gradients.length];
            return (
              <MenuLink
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </MenuLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
