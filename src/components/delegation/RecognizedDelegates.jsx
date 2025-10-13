import React from 'react';
import { ExternalLink, Users } from 'lucide-react';
import { DataTable } from '../shared/DataTable';
import { Badge } from '../shared/Badge';

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
 * RecognizedDelegates - Directory of top delegates
 */
export function RecognizedDelegates({ delegates, maxDelegates = 20 }) {
  if (!delegates || delegates.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Users size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No delegate data available</p>
        </div>
      </div>
    );
  }

  // Prepare data and precomputed totals
  const topDelegates = delegates.slice(0, maxDelegates);
  const totalCount = topDelegates.reduce((sum, d) => sum + (d.delegatorCount || d.delegators || 0), 0);
  const tableData = topDelegates.map((d, i) => ({ ...d, rank: i + 1 }));

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value) => <div className="font-semibold text-gray-900">#{value}</div>,
      sortable: false
    },
    {
      key: 'address',
      label: 'Delegate Address',
      render: (value, row) => {
        const addr = value || row.delegate || row.id;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{truncateAddress(addr)}</span>
            <a
              href={`https://snapshot.org/#/profile/${addr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        );
      },
      sortable: false
    },
    {
      key: 'delegatorCount',
      label: 'Votes',
      render: (value, row) => (
        <span className="font-semibold text-blue-600">
          {value || row.delegators || 0}
        </span>
      )
    },
    {
      key: 'votingPower',
      label: 'Voting Power',
      render: (value, row) => {
        const vp = value || row.delegatedVotes || 0;
        if (vp === 0) {
          return <span className="text-gray-400 text-sm">Not calculated</span>;
        }
        return (
          <span className="text-gray-700">{formatVotingPower(vp)}</span>
        );
      }
    },
    {
      key: 'shareOfTotal',
      label: 'Share',
      render: (value, row) => {
        const share = totalCount > 0 ? (((row.delegatorCount || row.delegators || 0) / totalCount) * 100) : 0;
        return <Badge variant={share > 10 ? 'warning' : 'info'}>{share.toFixed(1)}%</Badge>;
      },
      sortable: false
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Delegates</h3>
        <Badge variant="info">{topDelegates.length} delegates</Badge>
      </div>

      <DataTable columns={columns} data={tableData} defaultSortKey="delegatorCount" />
    </div>
  );
}
