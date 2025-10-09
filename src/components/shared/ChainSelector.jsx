import React, { useState } from 'react';
import { CHAIN_METADATA } from '../../services/multiChainService';

/**
 * ChainSelector component for filtering data by blockchain network
 * @param {string} selectedChain - Currently selected chain (default: 'all')
 * @param {function} onChainChange - Callback when chain selection changes
 * @param {Object} chainData - Optional chain voting power data to show activity
 * @param {string} size - Size variant (sm, md, lg)
 */
export function ChainSelector({
  selectedChain = 'all',
  onChainChange,
  chainData = null,
  size = 'md'
}) {
  const [activeChain, setActiveChain] = useState(selectedChain);

  const handleChainClick = (chain) => {
    setActiveChain(chain);
    if (onChainChange) {
      onChainChange(chain);
    }
  };

  const chains = ['all', 'mainnet', 'gnosis', 'arbitrum', 'base', 'polygon'];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const getChainLabel = (chain) => {
    if (chain === 'all') return 'All Chains';
    return CHAIN_METADATA[chain]?.shortName || chain;
  };

  const getChainColor = (chain) => {
    if (chain === 'all') return '#3B82F6'; // Blue for all
    return CHAIN_METADATA[chain]?.color || '#6B7280';
  };

  const hasChainActivity = (chain) => {
    if (!chainData || chain === 'all') return true;
    return chainData[chain] > 0;
  };

  const getChainVotingPower = (chain) => {
    if (!chainData || chain === 'all') return null;
    const vp = chainData[chain] || 0;
    if (vp === 0) return null;
    // Format in millions
    return `${(vp / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div className="flex flex-wrap gap-2">
        {chains.map((chain) => {
          const isActive = activeChain === chain;
          const chainColor = getChainColor(chain);
          const hasActivity = hasChainActivity(chain);
          const votingPower = getChainVotingPower(chain);

          return (
            <button
              key={chain}
              onClick={() => handleChainClick(chain)}
              disabled={!hasActivity}
              className={`
                ${sizeClasses[size]}
                rounded-lg font-medium transition-all duration-200
                border-2
                ${isActive
                  ? 'border-current shadow-md transform scale-105'
                  : 'border-transparent hover:border-gray-300'
                }
                ${!hasActivity
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:shadow-sm cursor-pointer'
                }
                flex items-center gap-2
              `}
              style={{
                backgroundColor: isActive ? `${chainColor}15` : 'transparent',
                color: isActive ? chainColor : '#6B7280'
              }}
              title={hasActivity ? getChainLabel(chain) : `No activity on ${getChainLabel(chain)}`}
            >
              {/* Chain Icon */}
              {chain !== 'all' && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: chainColor }}
                >
                  {CHAIN_METADATA[chain]?.icon || '?'}
                </span>
              )}

              {/* Chain Label */}
              <span className="font-semibold">
                {getChainLabel(chain)}
              </span>

              {/* Voting Power Badge */}
              {votingPower && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${chainColor}20`,
                    color: chainColor
                  }}
                >
                  {votingPower}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* No Activity Warning */}
      {chainData && activeChain !== 'all' && !hasChainActivity(activeChain) && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            No voting activity detected on {getChainLabel(activeChain)}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact ChainSelector for inline use (horizontal pill group)
 */
export function CompactChainSelector({
  selectedChain = 'all',
  onChainChange,
  activeChains = []
}) {
  const chains = ['all', 'mainnet', 'gnosis', 'arbitrum', 'base', 'polygon'];

  const handleChainClick = (chain) => {
    if (onChainChange) {
      onChainChange(chain);
    }
  };

  const isChainActive = (chain) => {
    if (chain === 'all') return true;
    return activeChains.length === 0 || activeChains.includes(chain);
  };

  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {chains.map((chain) => {
        const isSelected = selectedChain === chain;
        const isActive = isChainActive(chain);
        const metadata = chain === 'all'
          ? { shortName: 'All', color: '#3B82F6' }
          : CHAIN_METADATA[chain];

        return (
          <button
            key={chain}
            onClick={() => handleChainClick(chain)}
            disabled={!isActive}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${isSelected
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
              }
              ${!isActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              color: isSelected ? metadata.color : '#6B7280'
            }}
          >
            {metadata.shortName}
          </button>
        );
      })}
    </div>
  );
}
