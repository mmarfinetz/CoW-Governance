import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DataSourceAttribution } from './DataSourceAttribution';

/**
 * MetricCard component for displaying key metrics
 *
 * @param {string} dataSource - Data source identifier (e.g., "snapshot:proposals", "coingecko:price")
 * @param {Date|string} lastUpdated - Timestamp of last data update
 * @param {string} endpoint - Optional full API endpoint URL for tooltip
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'blue',
  loading = false,
  dataSource,
  lastUpdated,
  endpoint,
  showAttribution = false
}) {
  // Forum color mappings
  const colorClasses = {
    blue: 'border-cow-orange text-cow-orange',  // Map blue to orange
    green: 'border-cow-green text-cow-green',
    yellow: 'border-cow-badge-general text-cow-badge-general',
    red: 'border-cow-red text-cow-red',
    gray: 'border-gray-500 text-gray-400',
    purple: 'border-cow-purple text-cow-purple',
    orange: 'border-cow-orange text-cow-orange'
  };

  // Ensure color exists in colorClasses
  const safeColor = colorClasses[color] ? color : 'blue';
  const [borderClass, textClass] = colorClasses[safeColor].split(' ');

  if (loading) {
    return (
      <div className="bg-cow-brown bg-opacity-60 backdrop-blur-sm p-6 rounded-cow shadow-lg border-l-4 border-cow-brown-light">
        <div className="animate-pulse">
          <div className="h-4 bg-cow-brown-medium rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-cow-brown-medium rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-cow-brown bg-opacity-60 backdrop-blur-sm rounded-cow shadow-lg border-l-4 ${borderClass} overflow-hidden transition-all duration-200 hover:shadow-cow-glow-sm hover:border-opacity-100`}
      data-source={dataSource || 'unknown'}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2 text-cow-pink-light">{value}</p>
            {subtitle && (
              <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <Icon className={`${textClass} ml-4`} size={32} strokeWidth={1.5} />
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            {trendDirection === 'up' ? (
              <TrendingUp className="text-cow-green mr-1" size={16} />
            ) : (
              <TrendingDown className="text-cow-red mr-1" size={16} />
            )}
            <span className={trendDirection === 'up' ? 'text-cow-green' : 'text-cow-red'}>
              {trend}
            </span>
          </div>
        )}
      </div>
      {showAttribution && dataSource && lastUpdated && (
        <DataSourceAttribution
          source={dataSource}
          timestamp={lastUpdated}
          endpoint={endpoint}
        />
      )}
    </div>
  );
}
