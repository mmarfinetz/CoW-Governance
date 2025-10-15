import React from 'react';

/**
 * Badge component for status indicators with CoW Forum branding
 */
export function Badge({ children, variant = 'default', size = 'md' }) {
  const variantClasses = {
    default: 'bg-cow-brown-medium text-gray-300',
    success: 'bg-cow-green bg-opacity-20 text-cow-green border border-cow-green border-opacity-30',
    warning: 'bg-cow-badge-general bg-opacity-20 text-cow-badge-general border border-cow-badge-general border-opacity-30',
    danger: 'bg-cow-red bg-opacity-20 text-cow-red border border-cow-red border-opacity-30',
    info: 'bg-cow-orange bg-opacity-20 text-cow-orange border border-cow-orange border-opacity-30',
    active: 'bg-cow-orange text-white shadow-cow-glow-sm',
    closed: 'bg-cow-brown-light text-gray-400',
    passed: 'bg-cow-green text-white shadow-sm',
    failed: 'bg-cow-red text-white shadow-sm',
    // Forum-specific badge colors
    general: 'bg-cow-badge-general text-white',
    technical: 'bg-cow-badge-technical text-white',
    governance: 'bg-cow-badge-governance text-white',
    knowledge: 'bg-cow-badge-knowledge text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
