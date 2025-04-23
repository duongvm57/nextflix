import { getMoviesByGenre } from '@/lib/api';
import { getCategories } from '@/lib/api';
import { BreadcrumbSchema } from '@/components/schema/breadcrumb-schema';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GenreClientPage } from './client-page';
import type { Category } from '@/types';

// Export metadata từ file riêng biệt
export { generateMetadata } from './metadata';

// Sử dụng ISR thay vì force-static
export const revalidate = 3600; // revalidate mỗi 1 giờ

// Cache kết quả của các API calls
async function getMoviesByGenreWithCache(slug: string, page: number = 1) {
  try {
    return await getMoviesByGenre(slug, page);
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return {
      data: [],
      pagination: { totalItems: 0, totalItemsPerPage: 10, currentPage: 1, totalPages: 1 },
    };
  }
}

type Props = {
  params: { slug: string };
  searchParams: { page?: string };
};

export default async function GenrePage(props: Props) {
  // Access params and searchParams directly
  const { params, searchParams } = props;

  const slug = params.slug;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {/* @ts-expect-error Async Server Component */}
        <GenreContent slug={slug} page={page} />
      </Suspense>
    </div>
  );
}

async function GenreContent({ slug, page }: { slug: string; page: number }) {
  const [{ data: movies, pagination }, categories] = await Promise.all([
    getMoviesByGenreWithCache(slug, page),
    getCategories(),
  ]);

  if (pagination.totalPages > 0 && page > pagination.totalPages) {
    return Response.redirect(`/the-loai/${slug}?page=${pagination.totalPages}`);
  }

  const genre = (categories as Category[]).find(cat => cat.slug === slug);
  const genreName = genre
    ? genre.name
    : slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  // Prepare initial data for client component
  const initialData = {
    movies,
    pagination,
    genreName,
    slug,
  };

  return (
    <>
      <BreadcrumbSchema items={[{ name: genreName, url: `/the-loai/${slug}` }]} />
      <GenreClientPage initialData={initialData} />
    </>
  );
}
