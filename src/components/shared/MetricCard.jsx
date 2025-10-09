import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * MetricCard component for displaying key metrics
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'blue',
  loading = false
}) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-500',
    green: 'border-green-500 text-green-500',
    yellow: 'border-yellow-500 text-yellow-500',
    red: 'border-red-500 text-red-500',
    gray: 'border-gray-500 text-gray-500'
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-300">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colorClasses[color].split(' ')[0]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <Icon className={`${colorClasses[color].split(' ')[1]} ml-4`} size={32} strokeWidth={1.5} />
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trendDirection === 'up' ? (
            <TrendingUp className="text-green-500 mr-1" size={16} />
          ) : (
            <TrendingDown className="text-red-500 mr-1" size={16} />
          )}
          <span className={trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
