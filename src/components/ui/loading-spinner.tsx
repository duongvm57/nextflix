'use client';

import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  text?: string;
}

const LoadingSpinnerComponent = ({
  size = 'md',
  fullPage = false,
  text = '',
}: LoadingSpinnerProps) => {
  // Size mapping
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const spinnerClass = `inline-block ${sizeClasses[size]} animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`;

  // Simplified DOM structure
  const containerClass = fullPage
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
    : 'flex items-center justify-center p-4';

  const spinnerWithTextClass = `${spinnerClass} ${text ? (fullPage ? 'mb-4' : 'mb-2') : ''}`;
  const textClass = fullPage ? 'text-lg font-medium text-white' : 'text-sm font-medium';

  return (
    <div className={containerClass}>
      {fullPage ? (
        <div className="rounded-lg bg-gray-900 p-6 shadow-lg text-center">
          <div className={spinnerWithTextClass}></div>
          {text && <p className={textClass}>{text}</p>}
        </div>
      ) : (
        <>
          <div className={spinnerWithTextClass}></div>
          {text && <p className={textClass}>{text}</p>}
        </>
      )}
    </div>
  );
};

// Memoize the LoadingSpinner component to prevent unnecessary re-renders
export const LoadingSpinner = memo(LoadingSpinnerComponent);
LoadingSpinner.displayName = 'LoadingSpinner';
