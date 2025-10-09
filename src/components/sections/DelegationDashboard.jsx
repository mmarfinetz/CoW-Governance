import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { MetricCard } from '../shared/MetricCard';
import { ChartContainer } from '../shared/ChartContainer';
import { DelegationFlowChart } from '../delegation/DelegationFlowChart';
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
  if (!isVisible || (!delegates.length && !error && !metrics.totalDelegatedPower)) {
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
        <ErrorMessage message={error} onRetry={refetch} />
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
          title="Total Delegated Power"
          value={formatNumber(metrics.totalDelegatedPower)}
          icon={TrendingUp}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Total Delegators"
          value={metrics.totalDelegators.toLocaleString()}
          icon={Users}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Avg Delegation Size"
          value={formatNumber(metrics.averageDelegationSize)}
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
        title="Top 20 Delegators by Voting Power"
        subtitle="Distribution of delegated voting power across leading delegates"
      >
        <DelegationFlowChart delegates={delegates} maxDelegates={20} />
      </ChartContainer>

      {/* Recognized Delegates Directory */}
      <RecognizedDelegates delegates={delegates} maxDelegates={20} />

      {/* Delegation Lookup Tool */}
      <DelegationLookup />
    </div>
  );
}
