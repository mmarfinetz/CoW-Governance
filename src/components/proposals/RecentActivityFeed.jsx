import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink } from 'lucide-react';
import { fetchVotes } from '../../services/snapshotService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Badge } from '../shared/Badge';

/**
 * Truncate Ethereum address for display
 */
function truncateAddress(address) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format time ago
 */
function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() / 1000 - timestamp));

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Format voting power
 */
function formatVotingPower(vp) {
  if (vp >= 1000000) {
    return `${(vp / 1000000).toFixed(2)}M`;
  } else if (vp >= 1000) {
    return `${(vp / 1000).toFixed(2)}K`;
  }
  return vp.toFixed(2);
}

/**
 * RecentActivityFeed - Real-time feed of votes cast on active proposals
 */
export function RecentActivityFeed({ activeProposals, refreshInterval = 30000 }) {
  const [recentVotes, setRecentVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchRecentVotes = async () => {
    if (!activeProposals || activeProposals.length === 0) {
      setRecentVotes([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch votes for all active proposals
      const votesPromises = activeProposals.map(proposal =>
        fetchVotes(proposal.id, 1000).catch(err => {
          console.error(`Error fetching votes for ${proposal.id}:`, err);
          return [];
        })
      );

      const votesArrays = await Promise.all(votesPromises);

      // Combine all votes and add proposal info
      const allVotes = [];
      votesArrays.forEach((votes, index) => {
        const proposal = activeProposals[index];
        votes.forEach(vote => {
          allVotes.push({
            ...vote,
            proposalId: proposal.id,
            proposalTitle: proposal.title,
            cipNumber: proposal.cipNumber || 'N/A'
          });
        });
      });

      // Sort by creation time descending
      allVotes.sort((a, b) => b.created - a.created);

      // Take top 20 most recent
      setRecentVotes(allVotes.slice(0, 20));
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching recent votes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentVotes();

    // Set up auto-refresh
    const intervalId = setInterval(fetchRecentVotes, refreshInterval);

    return () => clearInterval(intervalId);
  }, [activeProposals, refreshInterval]);

  if (loading && recentVotes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={20} />
            Recent Voting Activity
          </h3>
        </div>
        <LoadingSpinner message="Loading recent votes..." />
      </div>
    );
  }

  if (!activeProposals || activeProposals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity size={20} />
            Recent Voting Activity
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No active proposals - no recent votes to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={20} className="animate-pulse text-green-500" />
          Recent Voting Activity
        </h3>
        {lastRefresh && (
          <span className="text-xs text-gray-500">
            Updated {timeAgo(Math.floor(lastRefresh.getTime() / 1000))}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {recentVotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No recent votes found
          </div>
        ) : (
          recentVotes.map((vote, index) => (
            <div
              key={`${vote.id}-${index}`}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {truncateAddress(vote.voter)}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">voted on</span>
                    <span className="text-sm font-medium text-blue-600 ml-2">
                      {vote.cipNumber}
                    </span>
                  </div>
                  <a
                    href={`https://snapshot.org/#/cow.eth/proposal/${vote.proposalId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="text-xs text-gray-500 truncate mb-2">
                  {vote.proposalTitle}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="info">
                    Choice: {vote.choice}
                  </Badge>
                  <span className="text-xs text-gray-600">
                    VP: {formatVotingPower(vote.vp)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {timeAgo(vote.created)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Auto-refreshes every {refreshInterval / 1000} seconds
        </p>
      </div>
    </div>
  );
}
