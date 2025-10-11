import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { MetricCard } from '../shared/MetricCard';
import { ChartContainer } from '../shared/ChartContainer';
import { useTreasuryData } from '../../hooks/useTreasuryData';
import { useTokenData } from '../../hooks/useTokenData';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export function TreasuryDashboard() {
  const [isVisible, setIsVisible] = useState(false);

  // Only fetch data when component becomes visible
  const { data: treasuryData, loading, error, refetch } = useTreasuryData(isVisible);
  const { data: tokenData } = useTokenData(isVisible);

  // Set visibility when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const compositionData = useMemo(() => {
    if (!treasuryData?.composition) return [];

    return [
      { name: 'Stablecoins', value: treasuryData.composition.stables || 0 },
      { name: 'ETH/WETH', value: treasuryData.composition.eth || 0 },
      { name: 'COW/vCOW', value: treasuryData.composition.cow || 0 },
      { name: 'Other Tokens', value: treasuryData.composition.other || 0 }
    ].filter(item => item.value > 0);
  }, [treasuryData]);

  // Show loading placeholder if data not yet loaded
  if (!isVisible || (!treasuryData && !error)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Treasury & Economic Model" />
        <LoadingSpinner message="Initializing treasury dashboard..." />
      </div>
    );
  }

  const budgetData = [
    { name: 'Treasury Core (CIP-62)', amount: 80000000, type: 'COW' },
    { name: 'Grants Committee', amount: 600000, type: 'xDAI' },
    { name: 'Grants - Volume Rewards', amount: 4990000, type: 'COW' },
    { name: 'Grants - General', amount: 1465260, type: 'COW' }
  ];

  const feeData = [
    { name: 'Surplus Fee', description: '50% of surplus, capped at 1% notional' },
    { name: 'Quote Improvement', description: '50% of improvement, capped at 1%' },
    { name: 'Gnosis Chain Volume', description: '10 basis points' }
  ];

  if (error) {
    const isQueryAccessError = error.includes('not found') || error.includes('private') || error.includes('permission');
    const isAuthError = error.includes('Invalid') || error.includes('401');
    
    return (
      <div className="space-y-6">
        <SectionHeader title="Treasury & Economic Model" />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Treasury Data Error</h3>
            <p className="text-red-800 font-medium mb-3">{error}</p>
            
            {isQueryAccessError && (
              <div className="space-y-2 text-sm text-red-700">
                <p className="font-semibold">The Dune queries may be private or inaccessible:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Query IDs in use: Treasury (3700123), Revenue (3700123), Solver Rewards (5270914), Solver Info (5533118)</li>
                  <li>These queries may be private or deleted</li>
                  <li>Fork public queries from: <a href="https://dune.com/cowprotocol" target="_blank" rel="noopener noreferrer" className="underline font-medium">dune.com/cowprotocol</a></li>
                  <li>Update query IDs in <code className="bg-red-100 px-1 rounded">src/config/govConfig.json</code></li>
                  <li>See the official CoW queries repo: <a href="https://github.com/cowprotocol/dune-queries" target="_blank" rel="noopener noreferrer" className="underline font-medium">github.com/cowprotocol/dune-queries</a></li>
                </ul>
              </div>
            )}
            
            {isAuthError && (
              <div className="space-y-2 text-sm text-red-700">
                <p className="font-semibold">API Key Issue:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check that your <code className="bg-red-100 px-1 rounded">.env</code> file has the correct key</li>
                  <li>Verify your key at: <a href="https://dune.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline font-medium">dune.com/settings/api</a></li>
                  <li>Make sure you restarted the dev server after adding the key</li>
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-sm text-red-600 mb-2">
                <strong>Check browser console (F12)</strong> for detailed error messages
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
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
        <SectionHeader title="Treasury & Economic Model" />
        <LoadingSpinner message="Loading treasury data from Dune Analytics, Safe, and The Graph APIs..." />
      </div>
    );
  }

  // If no protocol data at all, show setup message
  if (!treasuryData && !error) {
    const hasDuneKey = !!import.meta.env.VITE_DUNE_API_KEY;

    return (
      <div className="space-y-6">
        <SectionHeader title="Treasury & Economic Model" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ No Protocol Data Available</h3>
            {!hasDuneKey ? (
              <div className="space-y-2">
                <p className="text-yellow-800 font-medium">Missing Dune Analytics API Key</p>
                <p className="text-yellow-700 text-sm">
                  To view protocol revenue and metrics, you need to add your Dune API key:
                </p>
                <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1 ml-2">
                  <li>Get a free API key at <a href="https://dune.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline font-medium">dune.com/settings/api</a></li>
                  <li>Add to <code className="bg-yellow-100 px-1 rounded">.env</code> file: <code className="bg-yellow-100 px-1 rounded">VITE_DUNE_API_KEY=your_key_here</code></li>
                  <li>Restart the dev server: <code className="bg-yellow-100 px-1 rounded">npm run dev</code></li>
                </ol>
                <p className="text-yellow-700 text-sm mt-2">
                  Free tier: 20 query executions per day. See <a href="https://docs.dune.com/api-reference/" target="_blank" rel="noopener noreferrer" className="underline">Dune API docs</a> for details.
                </p>
              </div>
            ) : (
              <p className="text-yellow-800">
                Dune API key is configured but no data was returned. Check the browser console (Cmd+Option+J) for error details. Look for errors in duneService.js or the network tab for failed API requests.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const totalValue = treasuryData?.totalValue || 0;
  const cowPrice = tokenData?.price || 0;

  // Note: totalValue may be $0 if Safe API doesn't provide USD pricing
  const showTreasuryWarning = totalValue === 0 && treasuryData;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Treasury & Economic Model"
        subtitle={totalValue > 0 ? `Total treasury value: $${(totalValue / 1000000).toFixed(1)}M • Data source: ${treasuryData?.source || 'Safe + Dune'}` : `Showing protocol metrics • Data source: ${treasuryData?.source || 'Dune + The Graph'}`}
      />

      {showTreasuryWarning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Treasury USD value is not displayed because the Safe API does not provide token pricing data.
            Protocol revenue and metrics are shown from Dune Analytics and The Graph.
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {totalValue > 0 && (
          <MetricCard
            title="Total Treasury"
            value={`$${(totalValue / 1000000).toFixed(1)}M`}
            subtitle="Across all Safes"
            icon={DollarSign}
            color="green"
          />
        )}
        <MetricCard
          title="Protocol Fees Collected"
          value={`$${((treasuryData?.totalFeesCollected || 0) / 1000000).toFixed(1)}M`}
          subtitle="All-time revenue (Subgraph)"
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Total Volume"
          value={`$${((treasuryData?.totalVolume || 0) / 1000000000).toFixed(2)}B`}
          subtitle={`${treasuryData?.totalTrades?.toLocaleString() || 0} trades`}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard
          title="COW Token Price"
          value={`$${cowPrice.toFixed(4)}`}
          subtitle={`${tokenData?.priceChange24h?.toFixed(2)}% (24h)`}
          icon={TrendingUp}
          color={tokenData?.priceChange24h > 0 ? 'green' : 'red'}
          trend={`${tokenData?.priceChange24h > 0 ? '+' : ''}${tokenData?.priceChange24h?.toFixed(2)}%`}
          trendDirection={tokenData?.priceChange24h > 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treasury Composition */}
        <ChartContainer
          title="Treasury Composition"
          subtitle="Asset distribution across all Safes"
        >
          {compositionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${(value / 1000000).toFixed(1)}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(2)}M`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No composition data available
            </div>
          )}
        </ChartContainer>

        {/* Budget Allocation */}
        <ChartContainer
          title="Budget Allocations"
          subtitle="Major DAO budget commitments"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip formatter={(val, name) => [`${(val / 1000000).toFixed(2)}M ${budgetData.find(d => d.amount === val)?.type}`, 'Amount']} />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Monthly Revenue Chart (from Dune Custom Query) */}
      {treasuryData?.monthlyRevenue && treasuryData.monthlyRevenue.length > 0 && (
        <ChartContainer
          title={treasuryData.hasCustomDuneQuery ? "Monthly Protocol Revenue (Dune Custom Query)" : "Protocol Revenue"}
          subtitle={treasuryData.hasCustomDuneQuery ? "Monthly fees from your custom Dune Analytics query" : "Daily fees collected from protocol usage"}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={treasuryData.monthlyRevenue.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(month) => month ? new Date(month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : month}
              />
              <YAxis 
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
                label={{ value: treasuryData.hasCustomDuneQuery ? 'Monthly Revenue' : 'Daily Revenue', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(month) => month}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2} 
                name={treasuryData.hasCustomDuneQuery ? "Monthly Fees" : "Daily Fees"}
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Top Tokens by Volume (from Subgraph) */}
      {treasuryData?.topTokens && treasuryData.topTokens.length > 0 && (
        <ChartContainer
          title="Top Tokens by Trading Volume"
          subtitle="Most traded tokens on CoW Protocol (Source: Subgraph)"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={treasuryData.topTokens.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis 
                tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                label={{ value: 'Volume (USD)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, 'Volume']}
              />
              <Legend />
              <Bar dataKey="volume" fill="#3B82F6" name="Trading Volume" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Revenue Streams */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feeData.map((fee, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{fee.name}</h4>
              <p className="text-sm text-gray-600">{fee.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Token Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Distribution (TGE)</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Treasury', value: '44.4%' },
            { label: 'Team', value: '15%' },
            { label: 'GnosisDAO', value: '10%' },
            { label: 'Community', value: '10%' },
            { label: 'Investment', value: '10%' },
            { label: 'Advisory', value: '0.6%' }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-2xl font-bold text-blue-600">{item.value}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
