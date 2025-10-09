import React from 'react';
import { CHAIN_METADATA } from '../../services/multiChainService';

/**
 * ChainBadge component for displaying blockchain network badges
 * @param {string} chain - Chain identifier (mainnet, gnosis, arbitrum, base, polygon)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} showIcon - Whether to show chain icon
 * @param {boolean} showName - Whether to show chain name
 */
export function ChainBadge({
  chain = 'mainnet',
  size = 'md',
  showIcon = true,
  showName = true
}) {
  const metadata = CHAIN_METADATA[chain] || CHAIN_METADATA.unknown;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3 text-[10px]',
    md: 'w-4 h-4 text-xs',
    lg: 'w-5 h-5 text-sm'
  };

  // Generate Tailwind-compatible color classes
  const getColorClasses = () => {
    const colorMap = {
      '#3B82F6': 'bg-blue-100 text-blue-800 border-blue-300',      // Mainnet - blue
      '#10B981': 'bg-green-100 text-green-800 border-green-300',   // Gnosis - green
      '#F59E0B': 'bg-orange-100 text-orange-800 border-orange-300', // Arbitrum - orange
      '#8B5CF6': 'bg-purple-100 text-purple-800 border-purple-300', // Base - purple
      '#6366F1': 'bg-indigo-100 text-indigo-800 border-indigo-300', // Polygon - indigo
      '#6B7280': 'bg-gray-100 text-gray-800 border-gray-300'        // Unknown - gray
    };

    return colorMap[metadata.color] || colorMap['#6B7280'];
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${getColorClasses()} ${sizeClasses[size]}`}
      title={metadata.name}
    >
      {showIcon && (
        <span
          className={`inline-flex items-center justify-center rounded-full font-bold ${iconSizeClasses[size]}`}
          style={{
            backgroundColor: metadata.color,
            color: 'white'
          }}
        >
          {metadata.icon}
        </span>
      )}
      {showName && (
        <span>{metadata.shortName}</span>
      )}
    </span>
  );
}

/**
 * ChainBadgeList component for displaying multiple chain badges
 * @param {Array<string>} chains - Array of chain identifiers
 * @param {string} size - Size variant
 */
export function ChainBadgeList({ chains = [], size = 'sm' }) {
  if (!chains || chains.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex flex-wrap gap-1.5">
      {chains.map((chain, index) => (
        <ChainBadge
          key={`${chain}-${index}`}
          chain={chain}
          size={size}
        />
      ))}
    </div>
  );
}
