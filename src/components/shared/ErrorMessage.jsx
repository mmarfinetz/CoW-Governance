import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorMessage component for displaying errors with CoW Forum styling
 */
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-cow-red bg-opacity-10 border border-cow-red rounded-cow p-6 backdrop-blur-sm">
      <div className="flex items-start">
        <AlertCircle className="text-cow-red mt-0.5 mr-3" size={20} />
        <div className="flex-1">
          <h3 className="text-cow-red-light font-semibold">Error Loading Data</h3>
          <p className="text-cow-pink-light text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-cow-red text-white text-sm rounded-lg hover:bg-cow-red-light transition-all duration-200 shadow-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
