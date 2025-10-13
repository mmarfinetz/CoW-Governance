import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { MetricCard } from '../shared/MetricCard';
import { ChartContainer } from '../shared/ChartContainer';
import { DelegationFlowChart } from '../delegation/DelegationFlowChart';
import { DelegationBubbleMap } from '../delegation/DelegationBubbleMap';
import { RecognizedDelegates } from '../delegation/RecognizedDelegates';
import { DelegationLookup } from '../delegation/DelegationLookup';
import { useDelegationData } from '../../hooks/useDelegationData';
import { Users, TrendingUp, BarChart3, Target } from 'lucide-react';

/**
 * Format large numbers for display
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * DelegationDashboard - Comprehensive delegation analytics
 */
export function DelegationDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  // Only fetch data when component becomes visible
  const { delegates, metrics, loading, error, refetch } = useDelegationData(isVisible);

  // Set visibility when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Show loading placeholder if data not yet loaded
  if (!isVisible || (!delegates.length && !error && !metrics.totalDelegates)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Delegation & Voting Power" />
        <LoadingSpinner message="Initializing delegation dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Delegation & Voting Power" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Delegation Data Unavailable</h3>
            <div className="space-y-2">
              <p className="text-yellow-800 font-medium">Snapshot API Error</p>
              <p className="text-yellow-700 text-sm">
                {error}
              </p>
              <p className="text-yellow-700 text-sm mt-3">
                <strong>Debugging Info:</strong> Check the browser console (Cmd+Option+J) for detailed error messages.
                Visit{' '}
                <a
                  href="https://snapshot.org/#/delegate/cow.eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  snapshot.org/#/delegate/cow.eth
                </a>
                {' '}to view delegation information directly on Snapshot.
              </p>
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Delegation & Voting Power" />
        <LoadingSpinner message="Loading delegation data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Delegation & Voting Power"
        subtitle={`Analysis of ${delegates.length} delegates in CoW DAO governance`}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Delegates"
          value={metrics.totalDelegates.toLocaleString()}
          subtitle={`Unique delegates with ${metrics.totalDelegators} delegators`}
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Delegators"
          value={metrics.totalDelegators.toLocaleString()}
          subtitle="Active delegations"
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Avg Delegators per Delegate"
          value={metrics.averageDelegatorsPerDelegate.toFixed(1)}
          subtitle="Average delegation size"
          icon={BarChart3}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Top 10% Control"
          value={`${metrics.delegationConcentration.toFixed(1)}%`}
          subtitle="Delegation concentration"
          icon={Target}
          iconColor={metrics.delegationConcentration > 50 ? 'text-red-600' : 'text-yellow-600'}
          bgColor={metrics.delegationConcentration > 50 ? 'bg-red-50' : 'bg-yellow-50'}
        />
      </div>

      {/* Top Delegators Leaderboard - Visualization */}
      <ChartContainer
        title="Top 20 Delegates by Number of Delegators"
        subtitle="Distribution of delegations across leading delegates"
      >
        <DelegationFlowChart delegates={delegates} maxDelegates={20} />
      </ChartContainer>

      {/* Bubblemap */}
      <ChartContainer
        title="Delegation Bubblemap"
        subtitle="Bubble size reflects votes/delegations. Top entries shown."
      >
        <DelegationBubbleMap delegates={delegates} maxDelegates={30} />
      </ChartContainer>

      {/* Recognized Delegates Directory */}
      <RecognizedDelegates delegates={delegates} maxDelegates={20} />

      {/* Delegation Lookup Tool */}
      <DelegationLookup />
    </div>
  );
}
