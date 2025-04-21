'use client';

import { MenuLink } from '@/components/ui/menu-link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black py-8 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            {/* Hoàng Sa & Trường Sa Tag */}
            <div className="mb-4">
              <span className="bg-red-700 text-white text-sm font-medium px-4 py-1.5 rounded-full inline-block">
                Hoàng Sa & Trường Sa là của Việt Nam!
              </span>
            </div>
            <div className="mb-4">
              <MenuLink
                href="/"
                className="inline-block text-2xl font-bold text-primary drop-shadow-md"
              >
                NEXTFLIX
              </MenuLink>
            </div>
            <p className="mb-4 max-w-md">
              Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD
            </p>
          </div>

          {/* Categories & Genres */}
          <div>
            <h1 className="mb-4 text-lg font-semibold text-white">Danh mục</h1>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <MenuLink href="/danh-muc/phim-le" className="hover:text-primary">
                Phim lẻ
              </MenuLink>
              <MenuLink href="/the-loai/hanh-dong" className="hover:text-primary">
                Hành động
              </MenuLink>
              <MenuLink href="/danh-muc/phim-bo" className="hover:text-primary">
                Phim bộ
              </MenuLink>
              <MenuLink href="/the-loai/tinh-cam" className="hover:text-primary">
                Tình cảm
              </MenuLink>
              <MenuLink href="/danh-muc/hoat-hinh" className="hover:text-primary">
                Hoạt hình
              </MenuLink>
              <MenuLink href="/the-loai/kinh-di" className="hover:text-primary">
                Kinh dị
              </MenuLink>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h1 className="mb-4 text-lg font-semibold text-white">Liên kết</h1>
            <div className="grid grid-cols-1 gap-y-2">
              <MenuLink href="/chu-de" className="hover:text-primary">
                Chủ đề
              </MenuLink>
              <MenuLink href="/tim-kiem" className="hover:text-primary">
                Tìm kiếm
              </MenuLink>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p>
            &copy; {currentYear} Nextflix - Trang xem phim online chất lượng cao miễn phí Vietsub,
            thuyết minh, lồng tiếng full HD{' '}
          </p>
          <p className="mt-2 text-sm">
            Kho phim mới khổng lồ, phim chiếu rạp, phim bộ, phim lẻ từ nhiều quốc gia như Việt Nam,
            Hàn Quốc, Trung Quốc, Thái Lan, Nhật Bản, Âu Mỹ… đa dạng thể loại. Khám phá nền tảng
            phim trực tuyến hay nhất 2024 chất lượng 4K!.
          </p>
        </div>
      </div>
    </footer>
  );
}
