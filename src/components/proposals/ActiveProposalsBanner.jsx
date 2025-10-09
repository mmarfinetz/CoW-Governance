import React, { useState } from 'react';
import { Clock, Vote, RefreshCw } from 'lucide-react';
import { useActiveProposals } from '../../hooks/useActiveProposals';
import { QuorumProgressBar } from './QuorumProgressBar';
import { ProposalDetailView } from './ProposalDetailView';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

/**
 * ActiveProposalsBanner component
 * Displays horizontal scrollable cards for active proposals with real-time updates
 */
export function ActiveProposalsBanner() {
  const { activeProposals, loading, error, lastUpdated, refetch } = useActiveProposals();
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Format time remaining as countdown
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Ended';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Truncate title for card display
  const truncateTitle = (title, maxLength = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  if (loading && activeProposals.length === 0) {
    return <LoadingSpinner message="Loading active proposals..." />;
  }

  if (activeProposals.length === 0) {
    return null; // Don't show banner if no active proposals
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-md border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Vote className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">
              Active Proposals ({activeProposals.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-600">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refetch}
              className="p-2 hover:bg-white rounded-full transition-colors"
              title="Refresh active proposals"
            >
              <RefreshCw size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Horizontal scrollable cards */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-min">
            {activeProposals.map((proposal) => (
              <div
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className="flex-shrink-0 w-80 bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                {/* Proposal Title */}
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {truncateTitle(proposal.title)}
                </h4>

                {/* Time Remaining */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Clock size={14} />
                  <span>{formatTimeRemaining(proposal.timeRemaining)}</span>
                </div>

                {/* Quorum Progress */}
                <QuorumProgressBar
                  currentVotes={proposal.scores_total || 0}
                  quorum={proposal.quorum || 0}
                />

                {/* View Details Button */}
                <button className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Auto-refreshes every 30 seconds
        </div>
      </div>

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <ProposalDetailView
          proposalId={selectedProposal.id}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </>
  );
}
