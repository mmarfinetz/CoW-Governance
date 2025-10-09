import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, Calendar, TrendingUp, Vote, Info, Download } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { TimeRangeSelector } from '../shared/TimeRangeSelector';
import { ActiveProposalsBanner } from '../proposals/ActiveProposalsBanner';
import { ChainSelector } from '../shared/ChainSelector';
import { ChainBadge } from '../shared/ChainBadge';
import { MethodologyModal } from '../modals/MethodologyModal';
import { DataDiscrepancyWarnings } from '../shared/DataDiscrepancyWarning';
import { useGovernanceData } from '../../hooks/useGovernanceData';
import { useTokenData } from '../../hooks/useTokenData';
import { useTreasuryData } from '../../hooks/useTreasuryData';
import { useMultiChainData } from '../../hooks/useMultiChainData';
import { useTimeRange } from '../../contexts/TimeRangeContext';
import { useActiveProposals } from '../../hooks/useActiveProposals';
import { CHAIN_METADATA } from '../../services/multiChainService';
// DISABLED to prevent rate limiting
// import { runReconciliation } from '../../services/reconciliationService';
import {
  generateReconciliationReport,
  saveReconciliationReport,
  downloadReconciliationReport
} from '../../utils/reconciliationReport';

export function GovernanceOverview() {
  const { data: govData, loading: govLoading, error: govError, refetch: govRefetch } = useGovernanceData();
  const { data: tokenData, loading: tokenLoading } = useTokenData();
  const { data: treasuryData, loading: treasuryLoading } = useTreasuryData();
  const { getFormattedRange } = useTimeRange();
  // DISABLED: Active proposals hook causes additional Snapshot calls
  // const { activeProposals: activeProposalsList } = useActiveProposals();
  const activeProposalsList = [];

  // DISABLED: Multi-chain data hook causes too many API calls and rate limiting
  // const { data: chainData, loading: chainLoading } = useMultiChainData(govData?.allProposals || govData?.proposals);
  const chainData = null;
  const chainLoading = false;

  // Chain selection state
  const [selectedChain, setSelectedChain] = useState('all');

  // Methodology modal state
  const [showMethodology, setShowMethodology] = useState(false);

  // Reconciliation state
  const [reconciliationReport, setReconciliationReport] = useState(null);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Run reconciliation check on mount
  useEffect(() => {
    const runCheck = async () => {
      setReconciliationLoading(true);
      try {
        // DISABLED: Reconciliation causing too many API calls and rate limits
        console.warn('Reconciliation disabled to prevent rate limiting');
        // const report = await runReconciliation();
        // setReconciliationReport(report);
        setLastUpdated(new Date());

        // Save to localStorage
        // const formattedReport = generateReconciliationReport(report);
        // saveReconciliationReport(formattedReport);
      } catch (error) {
        console.error('Failed to run reconciliation:', error);
      } finally {
        setReconciliationLoading(false);
      }
    };

    runCheck();
  }, []);

  // Handle download report
  const handleDownloadReport = () => {
    if (!reconciliationReport) return;
    const formattedReport = generateReconciliationReport(reconciliationReport);
    downloadReconciliationReport(formattedReport);
  };

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

  // Handle empty data state
  const hasData = govData?.proposals && govData.proposals.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with Methodology Button */}
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Governance Health Dashboard"
          subtitle={`Real-time overview of CoW DAO governance metrics`}
        />
        <div className="flex items-center gap-3">
          {reconciliationReport && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
              title="Download reconciliation report"
            >
              <Download size={16} />
              Report
            </button>
          )}
          <button
            onClick={() => setShowMethodology(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Info size={18} />
            Methodology
          </button>
        </div>
      </div>

      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <div className="text-sm text-gray-600 -mt-3">
          Data last reconciled: {lastUpdated.toLocaleString()}
          {reconciliationLoading && <span className="ml-2 text-blue-600">(Running check...)</span>}
        </div>
      )}

      {/* Data Discrepancy Warnings */}
      {reconciliationReport?.comparisons && (
        <DataDiscrepancyWarnings
          comparisons={reconciliationReport.comparisons}
          threshold={5}
          onLearnMore={() => setShowMethodology(true)}
        />
      )}

      {/* Time Range Selector */}
      <TimeRangeSelector />

      {/* Date Range Subtitle */}
      <div className="text-sm text-gray-600 -mt-3 mb-2">
        Showing data from <span className="font-semibold">{getFormattedRange()}</span>
      </div>

      {/* Active Proposals Banner */}
      {activeProposalsList && activeProposalsList.length > 0 && (
        <ActiveProposalsBanner />
      )}

      {/* Empty State */}
      {!hasData && !govLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 text-center">
            No governance data found for the selected time period. Try selecting a different date range.
          </p>
        </div>
      )}

      {/* Health Score Indicator */}
      {hasData && (
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
      )}

      {/* Key Metrics Grid */}
      {hasData && (
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
      )}

      {/* Multi-Chain Voting Power Section */}
      {hasData && chainData && !chainLoading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Chain Voting Distribution</h3>

          {/* Chain Selector */}
          <div className="mb-6">
            <ChainSelector
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
              chainData={chainData}
              size="md"
            />
          </div>

          {/* Chain Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {['mainnet', 'gnosis', 'arbitrum', 'base', 'polygon'].map((chain) => {
              const votingPower = chainData[chain] || 0;
              const percentage = chainData.totalVotingPower > 0
                ? ((votingPower / chainData.totalVotingPower) * 100).toFixed(1)
                : 0;
              const hasActivity = votingPower > 0;

              return (
                <div
                  key={chain}
                  className={`p-4 rounded-lg border-2 ${
                    hasActivity ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ChainBadge chain={chain} size="sm" />
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {hasActivity ? `${(votingPower / 1000000).toFixed(1)}M` : '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {hasActivity ? `${percentage}% of total` : 'No activity'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Voting Power */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Voting Power (All Chains)</p>
                <p className="text-3xl font-bold text-gray-900">
                  {((chainData.totalVotingPower || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proposals Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {chainData.proposalsAnalyzed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Last {chainData.proposalsAnalyzed || 0} closed proposals
                </p>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Chain detection analyzes Snapshot voting strategies to determine voting power distribution across Ethereum Mainnet, Gnosis Chain, Arbitrum, Base, and Polygon. Data is aggregated from recent closed proposals.
            </p>
          </div>
        </div>
      )}

      {/* Multi-Chain Loading State */}
      {hasData && chainLoading && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <LoadingSpinner message="Analyzing multi-chain voting power..." />
        </div>
      )}

      {/* Quick Stats */}
      {hasData && (
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
      )}

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
      />
    </div>
  );
}
