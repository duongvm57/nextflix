'use client';

import Link from 'next/link';
import { MenuLink } from '@/components/ui/menu-link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black py-8 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <MenuLink
              href="/"
              className="mb-4 inline-block text-2xl font-bold text-primary drop-shadow-md"
            >
              NEXTFLIX
            </MenuLink>
            <p className="mb-4 max-w-md">
              Xem phim và chương trình truyền hình mới nhất trực tuyến với chất lượng HD
            </p>
          </div>

          {/* Categories */}
          <div>
            <h1 className="mb-4 text-lg font-semibold text-white">Danh mục</h1>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/phim-le" className="hover:text-primary">
                  Phim lẻ
                </Link>
              </li>
              <li>
                <Link href="/categories/phim-bo" className="hover:text-primary">
                  Phim bộ
                </Link>
              </li>
              <li>
                <Link href="/categories/hoat-hinh" className="hover:text-primary">
                  Hoạt hình
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h1 className="mb-4 text-lg font-semibold text-white">Thể loại</h1>
            <ul className="space-y-2">
              <li>
                <MenuLink href="/genres/hanh-dong" className="hover:text-primary">
                  Hành động
                </MenuLink>
              </li>
              <li>
                <MenuLink href="/genres/tinh-cam" className="hover:text-primary">
                  Tình cảm
                </MenuLink>
              </li>
              <li>
                <MenuLink href="/genres/kinh-di" className="hover:text-primary">
                  Kinh dị
                </MenuLink>
              </li>
              <li>
                <MenuLink href="/genres/hai-huoc" className="hover:text-primary">
                  Hài hước
                </MenuLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p>&copy; {currentYear} Nextflix. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-2 text-sm">Dự án demo được tạo với Next.js và Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}
