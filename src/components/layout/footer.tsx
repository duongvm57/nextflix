'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations();

  return (
    <footer className="bg-black py-8 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href={`/${locale}`} className="mb-4 inline-block text-2xl font-bold text-primary drop-shadow-md">
              NEXTFLIX
            </Link>
            <p className="mb-4 max-w-md">
              {t('common.tagline')}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t('navigation.categories')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/danh-sach/phim-le`} className="hover:text-primary">
                  {t('navigation.movies')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/danh-sach/phim-bo`} className="hover:text-primary">
                  {t('navigation.tvSeries')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/danh-sach/hoat-hinh`} className="hover:text-primary">
                  {t('navigation.anime')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">{t('navigation.genres')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/the-loai/hanh-dong`} className="hover:text-primary">
                  {t('category.action')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/the-loai/tinh-cam`} className="hover:text-primary">
                  {t('category.romance')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/the-loai/kinh-di`} className="hover:text-primary">
                  {t('category.horror')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/the-loai/hai-huoc`} className="hover:text-primary">
                  {t('category.comedy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p>&copy; {currentYear} Nextflix. {t('common.allRightsReserved')}</p>
          <p className="mt-2 text-sm">
            {t('common.demoProject')}
          </p>
        </div>
      </div>
    </footer>
  );
}
