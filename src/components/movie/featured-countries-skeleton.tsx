'use client';

export function FeaturedCountriesSkeleton({ className = '' }: { className?: string }) {
  // Tạo skeleton cho 3 quốc gia
  return (
    <div className={className}>
      {[1, 2, 3].map(index => (
        <div key={index} className="mb-8">
          {/* Header skeleton */}
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-800"></div>
            <div className="h-6 w-24 animate-pulse rounded bg-gray-800"></div>
          </div>

          {/* Movies carousel skeleton */}
          <div className="flex gap-4 overflow-hidden pb-4">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-[270px] w-[180px] animate-pulse rounded-lg bg-gray-800"
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
