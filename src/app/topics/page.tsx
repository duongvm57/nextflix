import { Metadata } from 'next';
import Link from 'next/link';
import { DOMAIN, SITE_NAME } from '@/lib/constants';
import { getCategories, getCountries } from '@/services/phimapi';
import { TYPE_LIST } from '@/lib/menu/phimapi-menu';

export function generateMetadata(): Metadata {
  const title = 'Tất cả chủ đề | ' + SITE_NAME;
  const description = 'Khám phá tất cả các chủ đề phim và chương trình truyền hình trên ' + SITE_NAME;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${DOMAIN}/topics`,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
    },
    alternates: {
      canonical: `${DOMAIN}/topics`,
    },
  };
}

// Predefined gradient colors for cards - dark monochrome with gradient from left to right
const gradients = [
  'from-gray-900/95 to-gray-800/95',     // Darkest gray
  'from-gray-800/90 to-gray-700/90',     // Dark gray
  'from-gray-700/85 to-gray-600/85',     // Medium-dark gray
  'from-gray-600/80 to-gray-500/80',     // Medium gray
  'from-gray-500/75 to-gray-400/75',     // Medium-light gray
  'from-gray-400/70 to-gray-300/70',     // Light gray
  'from-gray-300/65 to-gray-200/65',     // Lightest gray
];

// Các chủ đề tìm kiếm phổ biến
const popularSearches = [
  { name: 'Marvel', url: '/search?keyword=marvel' },
  { name: '4K', url: '/search?keyword=4k' },
  { name: 'Sitcom', url: '/search?keyword=sitcom' },
  { name: 'Xuyên Không', url: '/search?keyword=xuyen-khong' },
  { name: 'Cổ Trang', url: '/search?keyword=co-trang' },
  { name: 'Đình Nóc', url: '/search?keyword=dinh-noc' },
  { name: '9x', url: '/search?keyword=9x' },
  { name: 'Tham Vọng', url: '/search?keyword=tham-vong' },
  { name: 'Chữa Lành', url: '/search?keyword=chua-lanh' },
  { name: 'Phù Thủy', url: '/search?keyword=phu-thuy' },
];

// Các loại phim
const movieTypes = [
  { name: 'Phim lẻ', url: `/categories/${TYPE_LIST.PHIM_LE}` },
  { name: 'Phim bộ', url: `/categories/${TYPE_LIST.PHIM_BO}` },
  { name: 'TV Shows', url: `/categories/${TYPE_LIST.TV_SHOWS}` },
  { name: 'Hoạt hình', url: `/categories/${TYPE_LIST.HOAT_HINH}` },
];

// Các ngôn ngữ
const languages = [
  { name: 'Vietsub', url: `/categories/${TYPE_LIST.PHIM_VIETSUB}` },
  { name: 'Thuyết minh', url: `/categories/${TYPE_LIST.PHIM_THUYET_MINH}` },
  { name: 'Lồng tiếng', url: `/categories/${TYPE_LIST.PHIM_LONG_TIENG}` },
];

// Các năm gần đây
const recentYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { name: year.toString(), url: `/categories/${year}` };
  });
};

export default async function TopicsPage() {
  // Lấy danh sách thể loại và quốc gia từ API
  const [categories, countries] = await Promise.all([
    getCategories(),
    getCountries()
  ]);

  // Chuyển đổi thể loại và quốc gia thành định dạng topic
  const genreTopics = categories.map(category => ({
    name: category.name,
    url: `/genres/${category.slug}`
  }));

  const countryTopics = countries.map(country => ({
    name: country.name,
    url: `/countries/${country.slug}`
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
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
              <Link
                key={topic.url}
                href={topic.url}
                className={`bg-gradient-to-r ${gradientClass} rounded-lg p-4 text-white shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700/20 flex items-center justify-center h-[90px] border border-gray-700 hover:border-gray-500`}
              >
                <div className="text-center">
                  <div className="font-medium">{topic.name}</div>
                  <div className="text-xs opacity-80 mt-1">Xem thêm &gt;</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
