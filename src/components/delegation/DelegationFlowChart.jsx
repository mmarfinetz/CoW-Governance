import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

/**
 * Truncate Ethereum address for display
 */
function truncateAddress(address) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format voting power for display
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
 * DelegationFlowChart - Shows delegation distribution across top delegates
 */
export function DelegationFlowChart({ delegates, maxDelegates = 20 }) {
  if (!delegates || delegates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No delegation data available
      </div>
    );
  }

  // Prepare data for chart - top N delegates
  const chartData = delegates.slice(0, maxDelegates).map(delegate => ({
    address: delegate.address || delegate.delegate || delegate.id,
    shortAddress: truncateAddress(delegate.address || delegate.delegate || delegate.id),
    votingPower: delegate.votingPower || delegate.delegatedVotes || 0,
    delegatorCount: delegate.delegatorCount || delegate.delegators || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-mono text-xs text-gray-600 mb-2">{data.address}</p>
          {data.votingPower > 0 && (
            <p className="font-semibold text-gray-900">
              Voting Power: {formatVotingPower(data.votingPower)}
            </p>
          )}
          <p className="text-sm text-gray-600">
            Votes: {data.delegatorCount}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="shortAddress"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          label={{ value: 'Votes Cast', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="delegatorCount" name="Votes Cast" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
