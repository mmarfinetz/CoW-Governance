import React from 'react';

/**
 * ChartContainer component for wrapping Recharts components
 */
export function ChartContainer({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
