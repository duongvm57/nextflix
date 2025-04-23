import { Metadata } from 'next';
import { getMoviesByCategory, getCategories } from '@/lib/api';
import { FilterProvider } from '@/components/providers/filter-provider';
import { FilteredMovieGrid } from '@/components/movie/filtered-movie-grid';
import { Category } from '@/types';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;

  // Lấy thông tin thể loại từ API
  const categories = await getCategories();
  const category = categories.find((c: Category) => c.slug === slug);

  if (!category) {
    return {
      title: 'Thể loại không tồn tại',
      description: 'Thể loại phim này không tồn tại trong hệ thống.',
    };
  }

  return {
    title: `Phim ${category.name} - Tuyển tập phim hay nhất`,
    description: `Xem phim ${category.name} hay nhất, cập nhật mới nhất với chất lượng HD, Vietsub, Thuyết minh.`,
    keywords: `phim ${category.name}, phim hay, phim mới, phim HD, phim vietsub, phim thuyết minh`,
  };
}

export default async function CategoryPage(props: Props) {
  // Truy cập params và searchParams trực tiếp
  const { params, searchParams } = props;

  const slug = params.slug;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 1;

  // Lấy dữ liệu ban đầu từ server
  const initialData = await getMoviesByCategory(slug, page);

  // Lấy thông tin thể loại từ API
  const categories = await getCategories();
  const category = categories.find((c: Category) => c.slug === slug);

  // Nếu không tìm thấy thể loại, trả về 404
  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <FilterProvider initialData={initialData}>
          <FilteredMovieGrid
            title={`Phim ${category.name}`}
            showFilter={true}
            initialData={initialData}
          />
        </FilterProvider>
      </Suspense>
    </div>
  );
}
