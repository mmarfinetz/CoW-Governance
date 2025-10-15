import React from 'react';

/**
 * SectionHeader component for dashboard sections with CoW Forum branding
 */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cow-pink-light">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
