import React from 'react';
import { Calendar, ExternalLink, MessageSquare, Eye } from 'lucide-react';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';

/**
 * UpcomingProposals - Displays upcoming proposals from forum
 */
export function UpcomingProposals({ upcomingProposals, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Proposals
        </h3>
        <LoadingSpinner message="Loading forum proposals..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Proposals
        </h3>
        <div className="text-center py-8">
          <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-4">
            Forum data temporarily unavailable. This is expected if CORS prevents direct forum access.
          </p>
        </div>
      </div>
    );
  }

  if (!upcomingProposals || upcomingProposals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Proposals
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No upcoming proposals found</p>
          <p className="text-xs mt-2">
            Check the{' '}
            <a
              href="https://forum.cow.fi/c/proposals"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              CoW Forum
            </a>{' '}
            for the latest discussions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar size={20} />
          Upcoming Proposals
        </h3>
        <Badge variant="info">{upcomingProposals.length} proposals</Badge>
      </div>

      <div className="space-y-3">
        {upcomingProposals.map(proposal => (
          <div
            key={proposal.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {proposal.cipNumber && (
                    <Badge variant="info">{proposal.cipNumber}</Badge>
                  )}
                  <Badge variant="default">Discussion</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {proposal.title}
                </h4>
                {proposal.excerpt && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {proposal.excerpt}
                  </p>
                )}
              </div>
              <a
                href={proposal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex-shrink-0"
              >
                <ExternalLink size={18} />
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{proposal.created.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare size={12} />
                <span>{proposal.replies} replies</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={12} />
                <span>{proposal.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <a
          href="https://forum.cow.fi/c/proposals"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
        >
          View all proposals on forum
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
