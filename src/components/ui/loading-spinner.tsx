'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  fullPage = false,
  text = 'Đang tải...',
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const spinnerClass = `inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`;

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-lg bg-gray-900 p-6 shadow-lg">
          <div className="text-center">
            <div className={`${spinnerClass} mb-4`}></div>
            <p className="text-lg font-medium text-white">{text}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className={`${spinnerClass} ${text ? 'mb-2' : ''}`}></div>
        {text && <p className="text-sm font-medium">{text}</p>}
      </div>
    </div>
  );
}
