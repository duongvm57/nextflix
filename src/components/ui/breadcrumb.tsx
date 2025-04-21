'use client';

import { MenuLink } from '@/components/ui/menu-link';
import { Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex flex-wrap items-center text-sm text-gray-400">
        <li>
          <MenuLink href="/" className="flex items-center hover:text-primary transition-colors">
            <Home size={16} className="mr-1" />
            <span className="hidden xs:inline">Trang chủ</span>
          </MenuLink>
        </li>

        {items.map((item, index) => (
          <li key={item.url} className={index < items.length - 1 ? 'breadcrumb-item' : ''}>
            {index === items.length - 1 ? (
              <span className="font-medium text-white" aria-current="page">
                {item.name}
              </span>
            ) : (
              <MenuLink href={item.url} className="hover:text-primary transition-colors">
                {item.name}
              </MenuLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
