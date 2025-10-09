import React, { useEffect } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { ActiveProposalsBanner } from '../proposals/ActiveProposalsBanner';
import { RecentActivityFeed } from '../proposals/RecentActivityFeed';
import { UpcomingProposals } from '../proposals/UpcomingProposals';
import { useActiveProposals } from '../../hooks/useActiveProposals';
import { useUpcomingProposals } from '../../hooks/useUpcomingProposals';
import { RefreshCw } from 'lucide-react';

/**
 * LiveGovernance - Real-time governance activity dashboard
 * Auto-refreshes every 30 seconds
 */
export function LiveGovernance() {
  const {
    activeProposals,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
    lastUpdated: activeLastUpdated
  } = useActiveProposals();

  const {
    upcomingProposals,
    loading: upcomingLoading,
    error: upcomingError
  } = useUpcomingProposals();

  // Auto-refresh active proposals every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchActive();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [refetchActive]);

  if (activeError) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Live Governance Activity" />
        <ErrorMessage message={activeError} onRetry={refetchActive} />
      </div>
    );
  }

  if (activeLoading && (!activeProposals || activeProposals.length === 0)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Live Governance Activity" />
        <LoadingSpinner message="Loading live governance data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Live Governance Activity"
        subtitle="Real-time view of active proposals and voting activity"
        action={
          <div className="flex items-center gap-3">
            {activeLastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {activeLastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refetchActive}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Active Proposals Banner */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Proposals</h3>
        <ActiveProposalsBanner />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Voting Activity */}
        <RecentActivityFeed
          activeProposals={activeProposals}
          refreshInterval={30000}
        />

        {/* Upcoming Proposals from Forum */}
        <UpcomingProposals
          upcomingProposals={upcomingProposals}
          loading={upcomingLoading}
          error={upcomingError}
        />
      </div>

      {/* Auto-refresh Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Live Updates:</span> This page automatically refreshes every 30 seconds to show the latest governance activity
        </p>
      </div>
    </div>
  );
}
