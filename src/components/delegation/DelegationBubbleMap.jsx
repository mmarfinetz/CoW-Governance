import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid } from 'recharts';

function truncateAddress(address) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatVotingPower(vp) {
  if (!vp || vp <= 0) return '0';
  if (vp >= 1_000_000) return `${(vp / 1_000_000).toFixed(2)}M`;
  if (vp >= 1_000) return `${(vp / 1_000).toFixed(1)}K`;
  return vp.toFixed(2);
}

export function DelegationBubbleMap({ delegates, maxDelegates = 30, columns = 10 }) {
  const data = useMemo(() => {
    if (!delegates || delegates.length === 0) return { points: [], rows: 0, columns };

    const top = delegates.slice(0, maxDelegates);
    const rows = Math.max(1, Math.ceil(top.length / columns));

    const points = top.map((d, i) => {
      const x = (i % columns) + 1; // start at 1 for padding
      const y = Math.floor(i / columns) + 1;
      const delegatorCount = d.delegatorCount || d.delegators || 0;
      const vp = d.votingPower || d.delegatedVotes || 0;
      const sizeValue = vp > 0 ? vp : delegatorCount; // prefer real voting power when available
      return {
        x,
        y,
        size: Math.max(1, sizeValue),
        address: d.address || d.delegate || d.id,
        shortAddress: truncateAddress(d.address || d.delegate || d.id),
        delegatorCount,
        votingPower: vp
      };
    });

    return { points, rows, columns };
  }, [delegates, maxDelegates, columns]);

  if (!data.points.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No delegation data available
      </div>
    );
  }

  const height = Math.max(320, data.rows * 160);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-mono text-xs text-gray-600 mb-2">{p.address}</p>
          <p className="text-sm text-gray-900"><span className="font-semibold">Votes/Delegators:</span> {p.delegatorCount}</p>
          {p.votingPower > 0 && (
            <p className="text-sm text-gray-900"><span className="font-semibold">Voting Power:</span> {formatVotingPower(p.votingPower)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" name="" domain={[0, data.columns + 1]} tick={false} axisLine={false} />
        <YAxis type="number" dataKey="y" name="" domain={[0, data.rows + 1]} tick={false} axisLine={false} />
        <ZAxis type="number" dataKey="size" range={[20, 300]} name="Size" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Scatter data={data.points} fill="#3B82F6" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
