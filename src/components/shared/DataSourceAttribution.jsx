import React from 'react';
import { InfoTooltip } from './InfoTooltip';
import { Clock } from 'lucide-react';

/**
 * DataSourceAttribution Component
 * Displays data source and last update timestamp for transparency
 */
export function DataSourceAttribution({
  source,
  timestamp,
  inline = false,
  endpoint = null,
  className = ''
}) {
  // Format timestamp to "X minutes ago" or "X hours ago"
  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';

    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get friendly API name from source string
  const getSourceName = (src) => {
    const sourceMap = {
      snapshot: 'Snapshot GraphQL',
      dune: 'Dune Analytics',
      coingecko: 'CoinGecko',
      etherscan: 'Etherscan',
      safe: 'Safe Transaction Service',
      cowprotocol: 'CoW Protocol API',
      'cow-protocol': 'CoW Protocol API'
    };

    // Handle compound sources like "snapshot:proposals"
    const baseSrc = src.split(':')[0].toLowerCase();
    return sourceMap[baseSrc] || src;
  };

  const sourceName = getSourceName(source);
  const timeAgo = formatTimeAgo(timestamp);

  // Tooltip content with full details
  const tooltipContent = (
    <div className="text-xs space-y-1">
      <div>
        <span className="font-semibold">Source:</span> {sourceName}
      </div>
      {endpoint && (
        <div className="break-all">
          <span className="font-semibold">Endpoint:</span>{' '}
          <code className="text-[10px] bg-gray-800 px-1 py-0.5 rounded">
            {endpoint}
          </code>
        </div>
      )}
      {timestamp && (
        <div>
          <span className="font-semibold">Updated:</span>{' '}
          {new Date(timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );

  // Inline version (compact, for use in tight spaces)
  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-gray-500 ${className}`}>
        <InfoTooltip content={tooltipContent}>
          <span className="flex items-center gap-1 hover:text-gray-700 cursor-help">
            <Clock size={12} className="opacity-60" />
            <span className="font-medium">{sourceName}</span>
            <span className="opacity-60">•</span>
            <span>{timeAgo}</span>
          </span>
        </InfoTooltip>
      </span>
    );
  }

  // Block version (full width, for use at bottom of cards/sections)
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs ${className}`}
    >
      <div className="flex items-center gap-2 text-gray-600">
        <span className="font-medium">Source:</span>
        <InfoTooltip content={tooltipContent}>
          <span className="text-gray-800 hover:text-blue-600 cursor-help font-medium">
            {sourceName}
          </span>
        </InfoTooltip>
      </div>
      <div className="flex items-center gap-1 text-gray-500">
        <Clock size={12} className="opacity-60" />
        <span>Updated {timeAgo}</span>
      </div>
    </div>
  );
}

/**
 * DataSourceBadge Component
 * Minimal badge version for inline display in metrics
 */
export function DataSourceBadge({ source, className = '' }) {
  const getSourceName = (src) => {
    const sourceMap = {
      snapshot: 'Snapshot',
      dune: 'Dune',
      coingecko: 'CoinGecko',
      etherscan: 'Etherscan',
      safe: 'Safe',
      cowprotocol: 'CoW API',
      'cow-protocol': 'CoW API'
    };

    const baseSrc = src.split(':')[0].toLowerCase();
    return sourceMap[baseSrc] || src;
  };

  const sourceName = getSourceName(source);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 ${className}`}
      title={`Data source: ${source}`}
    >
      {sourceName}
    </span>
  );
}
