import React from 'react';
import { InfoTooltip } from '../shared/InfoTooltip';

/**
 * QuorumProgressBar component
 * Visual progress bar showing votes vs quorum requirement
 */
export function QuorumProgressBar({ currentVotes, quorum, className = '' }) {
  const percentage = quorum > 0 ? Math.min(100, (currentVotes / quorum) * 100) : 0;

  // Determine color based on progress
  const getColorClass = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-700 font-medium">
          {formatNumber(currentVotes)} / {formatNumber(quorum)} votes ({percentage.toFixed(1)}%)
        </span>
        <InfoTooltip
          content={`Quorum requirement: ${formatNumber(quorum)} votes. Current votes: ${formatNumber(currentVotes)}`}
        />
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600">
        {percentage >= 100 ? (
          <span className="text-green-600 font-semibold">✓ Quorum met</span>
        ) : percentage >= 80 ? (
          <span className="text-yellow-600 font-semibold">Close to quorum</span>
        ) : (
          <span className="text-gray-600">Below quorum</span>
        )}
      </div>
    </div>
  );
}
