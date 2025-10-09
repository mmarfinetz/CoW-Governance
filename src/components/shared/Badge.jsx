import React from 'react';

/**
 * Badge component for status indicators
 */
export function Badge({ children, variant = 'default', size = 'md' }) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    active: 'bg-blue-500 text-white',
    closed: 'bg-gray-500 text-white',
    passed: 'bg-green-500 text-white',
    failed: 'bg-red-500 text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
