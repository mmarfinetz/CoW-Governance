import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorMessage component for displaying errors
 */
export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
