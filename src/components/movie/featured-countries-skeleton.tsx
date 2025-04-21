'use client';

export function FeaturedCountriesSkeleton({ className = '' }: { className?: string }) {
  // Tạo skeleton cho 3 quốc gia với số lượng phần tử DOM tối thiểu
  const renderCountrySkeleton = () => (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-800"></div>
        <div className="h-6 w-24 animate-pulse rounded bg-gray-800"></div>
      </div>
      <div className="flex gap-4 overflow-hidden pb-4">
        {/* Chỉ hiển thị 3 skeleton thay vì 5 để giảm DOM */}
        <div className="flex-shrink-0 h-[270px] w-[180px] animate-pulse rounded-lg bg-gray-800" />
        <div className="flex-shrink-0 h-[270px] w-[180px] animate-pulse rounded-lg bg-gray-800" />
        <div className="flex-shrink-0 h-[270px] w-[180px] animate-pulse rounded-lg bg-gray-800" />
      </div>
    </div>
  );

  return (
    <div className={className}>
      {renderCountrySkeleton()}
      {renderCountrySkeleton()}
      {renderCountrySkeleton()}
    </div>
  );
}
