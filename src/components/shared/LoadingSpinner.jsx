import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingSpinner component
 */
export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`animate-spin text-blue-500 ${sizeClasses[size]}`} />
      {message && (
        <p className="text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
}
