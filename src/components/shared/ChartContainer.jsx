import React from 'react';
import { DataSourceAttribution } from './DataSourceAttribution';

/**
 * ChartContainer component for wrapping Recharts components
 *
 * @param {string} dataSource - Data source identifier (e.g., "snapshot:proposals", "dune:treasury")
 * @param {Date|string} lastUpdated - Timestamp of last data update
 * @param {string} endpoint - Optional full API endpoint URL for tooltip
 * @param {boolean} showAttribution - Whether to display data source attribution footer
 */
export function ChartContainer({
  title,
  subtitle,
  children,
  className = '',
  dataSource,
  lastUpdated,
  endpoint,
  showAttribution = false
}) {
  return (
    <div
      className={`bg-cow-brown bg-opacity-60 backdrop-blur-sm rounded-cow shadow-lg overflow-hidden border border-cow-brown-light ${className}`}
      data-source={dataSource || 'unknown'}
    >
      <div className="p-6">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-cow-pink-light">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className="w-full">
          {children}
        </div>
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
