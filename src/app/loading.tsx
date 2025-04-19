import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <LoadingSpinner size="lg" text="Đang tải..." />
    </div>
  );
}
