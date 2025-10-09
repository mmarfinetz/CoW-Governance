import React from 'react';
import { Shield, Users, DollarSign, Calendar, TrendingUp, Vote } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { useGovernanceData } from '../../hooks/useGovernanceData';
import { useTokenData } from '../../hooks/useTokenData';
import { useTreasuryData } from '../../hooks/useTreasuryData';

export function GovernanceOverview() {
  const { data: govData, loading: govLoading, error: govError, refetch: govRefetch } = useGovernanceData();
  const { data: tokenData, loading: tokenLoading } = useTokenData();
  const { data: treasuryData, loading: treasuryLoading } = useTreasuryData();

  if (govError) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Governance Health Dashboard"
          subtitle="Real-time overview of CoW DAO governance metrics"
        />
        <ErrorMessage message={govError} onRetry={govRefetch} />
      </div>
    );
  }

  if (govLoading || tokenLoading || treasuryLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Governance Health Dashboard"
          subtitle="Real-time overview of CoW DAO governance metrics"
        />
        <LoadingSpinner message="Loading governance data..." />
      </div>
    );
  }

  const quorum = govData?.quorum || 35000000;
  const activeProposals = govData?.metrics?.activeProposals || 0;
  const avgParticipation = govData?.metrics?.averageParticipation || 0;
  const totalProposals = govData?.metrics?.totalProposals || 0;
  const treasuryValue = treasuryData?.totalValue || 0;
  const holderCount = tokenData?.holderCount || 0;
  const votingPeriod = govData?.votingPeriod || 7;
  const votingDelay = govData?.votingDelay || 3;

  // Calculate participation rate
  const participationRate = quorum > 0 ? ((avgParticipation / quorum) * 100).toFixed(1) : 0;

  // Calculate health score (0-100)
  const healthScore = Math.min(100, Math.round(
    (participationRate * 0.4) + // 40% weight on participation
    (activeProposals > 0 ? 20 : 0) + // 20% for having active proposals
    (totalProposals > 50 ? 20 : totalProposals * 0.4) + // 20% for proposal history
    (treasuryValue > 0 ? 20 : 0) // 20% for treasury health
  ));

  const getHealthStatus = (score) => {
    if (score >= 80) return { text: 'Healthy', color: 'green' };
    if (score >= 60) return { text: 'Active', color: 'blue' };
    if (score >= 40) return { text: 'Moderate', color: 'yellow' };
    return { text: 'Needs Attention', color: 'red' };
  };

  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Governance Health Dashboard"
        subtitle={`Real-time overview of CoW DAO governance metrics • Last updated: ${new Date().toLocaleString()}`}
      />

      {/* Health Score Indicator */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Governance Health Score</h3>
            <div className="flex items-baseline mt-2">
              <span className="text-5xl font-bold">{healthScore}</span>
              <span className="text-2xl ml-2 opacity-75">/100</span>
            </div>
            <p className="mt-2 text-sm opacity-90">Status: {healthStatus.text}</p>
          </div>
          <Shield size={64} className="opacity-20" />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Current Quorum"
          value={`${(quorum / 1000000).toFixed(1)}M`}
          subtitle="Votes required to pass proposals"
          icon={Vote}
          color="blue"
        />

        <MetricCard
          title="Active Proposals"
          value={activeProposals}
          subtitle={`${totalProposals} total proposals`}
          icon={TrendingUp}
          color="green"
        />

        <MetricCard
          title="Avg Participation"
          value={`${(avgParticipation / 1000000).toFixed(1)}M`}
          subtitle={`${participationRate}% of quorum`}
          icon={Users}
          color="purple"
          trend={participationRate > 100 ? '+' + (participationRate - 100).toFixed(1) + '%' : null}
          trendDirection={participationRate > 100 ? 'up' : 'down'}
        />

        <MetricCard
          title="Treasury Size"
          value={`$${(treasuryValue / 1000000).toFixed(1)}M`}
          subtitle="Total DAO treasury value"
          icon={DollarSign}
          color="green"
        />

        <MetricCard
          title="Token Holders"
          value={holderCount.toLocaleString()}
          subtitle="On Ethereum mainnet"
          icon={Users}
          color="blue"
        />

        <MetricCard
          title="Voting Period"
          value={`${votingPeriod} days`}
          subtitle={`+ ${votingDelay} day execution delay`}
          icon={Calendar}
          color="gray"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Governance Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {govData?.metrics?.successRate?.toFixed(0) || 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Max Votes Recorded</p>
            <p className="text-2xl font-bold text-gray-900">
              {((govData?.metrics?.maxVotes || 0) / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Voting Mechanism</p>
            <p className="text-lg font-semibold text-gray-900">Snapshot + oSnap</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Token Symbol</p>
            <p className="text-lg font-semibold text-gray-900">COW / vCOW</p>
          </div>
        </div>
      </div>
    </div>
  );
}
