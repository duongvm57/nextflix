'use client';

export function MenuSkeleton() {
  return (
    <div className="flex space-x-8 animate-pulse">
      {/* Trang chủ */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>

      {/* Loại phim */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>

      {/* Ngôn ngữ */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>

      {/* Thể loại */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>

      {/* Quốc gia */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>

      {/* Năm */}
      <div className="h-4 w-20 bg-gray-700 rounded"></div>
    </div>
  );
}
