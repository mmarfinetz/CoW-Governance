import React from 'react';
import { ExternalLink, TrendingUp, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { Badge } from '../shared/Badge';

export function DelegateCard({ delegate }) {
  if (!delegate) return null;

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatVotingPower = (vp) => {
    if (!vp) return '0';
    if (vp >= 1000000) {
      return `${(vp / 1000000).toFixed(2)}M`;
    } else if (vp >= 1000) {
      return `${(vp / 1000).toFixed(2)}K`;
    }
    return vp.toFixed(2);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getParticipationBadgeVariant = (rate) => {
    if (rate >= 75) return 'success';
    if (rate >= 50) return 'info';
    if (rate >= 25) return 'warning';
    return 'error';
  };

  const participationRate = delegate.participationRate || 0;
  const totalVotes = delegate.totalVotes || 0;
  const delegatorCount = delegate.delegatorCount || 0;
  const lastVoteDate = delegate.lastVoteDate;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {delegate.name ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {delegate.name}
              </h3>
              <code className="text-xs font-mono text-gray-500">
                {formatAddress(delegate.address)}
              </code>
            </>
          ) : (
            <code className="text-sm font-mono text-gray-900">
              {delegate.address}
            </code>
          )}
          {delegate.isRecognized && (
            <div className="mt-2">
              <Badge variant="success">
                <CheckCircle size={12} className="mr-1" />
                Recognized Delegate
              </Badge>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <a
            href={`https://snapshot.org/#/profile/${delegate.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
            title="View on Snapshot"
          >
            <ExternalLink size={18} />
          </a>
          {delegate.forumUsername && (
            <a
              href={`https://forum.cow.fi/u/${delegate.forumUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
              title="View on Forum"
            >
              <MessageSquare size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Bio */}
      {delegate.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {delegate.bio}
        </p>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <TrendingUp size={14} className="mr-1" />
            Participation Rate
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {participationRate.toFixed(0)}%
            </span>
            <Badge variant={getParticipationBadgeVariant(participationRate)}>
              {participationRate >= 75 ? 'High' : participationRate >= 50 ? 'Medium' : 'Low'}
            </Badge>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <Users size={14} className="mr-1" />
            Delegators
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {delegatorCount}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Total Votes Cast:</span>
          <span className="font-medium text-gray-900">{totalVotes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Last Vote:</span>
          <span className="font-medium text-gray-900">
            {formatDate(lastVoteDate)}
          </span>
        </div>
        {delegate.votingPower && (
          <div className="flex justify-between">
            <span className="text-gray-500">Voting Power:</span>
            <span className="font-medium text-blue-600">
              {formatVotingPower(delegate.votingPower)}
            </span>
          </div>
        )}
      </div>

      {/* Recent Votes Summary */}
      {delegate.recentVotes && delegate.recentVotes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Recent Activity
          </h4>
          <div className="space-y-1">
            {delegate.recentVotes.slice(0, 3).map((vote, index) => (
              <div key={index} className="text-xs text-gray-600 truncate">
                Voted on: {vote.proposal?.title || 'Proposal'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forum Activity */}
      {delegate.forumActivity && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Forum Activity
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Posts:</span>
              <span className="ml-1 font-medium text-gray-900">
                {delegate.forumActivity.posts || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Rationales:</span>
              <span className="ml-1 font-medium text-gray-900">
                {delegate.forumActivity.rationalesPosted || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Category Badge */}
      {delegate.category && (
        <div className="mt-4">
          <Badge variant="info">{delegate.category}</Badge>
        </div>
      )}
    </div>
  );
}
