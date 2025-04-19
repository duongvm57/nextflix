'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

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
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:text-primary transition-colors"
          >
            <Home size={16} className="mr-1" />
            <span className="hidden xs:inline">Trang chủ</span>
          </Link>
          {items.length > 0 && (
            <ChevronRight size={14} className="mx-1 text-gray-500" />
          )}
        </li>

        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index === items.length - 1 ? (
              <span className="font-medium text-white" aria-current="page">
                {item.name}
              </span>
            ) : (
              <>
                <Link
                  href={item.url}
                  className="hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                <ChevronRight size={14} className="mx-1 text-gray-500" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
