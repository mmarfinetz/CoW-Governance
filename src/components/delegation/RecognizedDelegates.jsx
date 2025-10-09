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

  const columns = [
    {
      key: 'rank',
      label: 'Rank',
      render: (value, row, index) => (
        <div className="font-semibold text-gray-900">#{index + 1}</div>
      ),
      sortable: false
    },
    {
      key: 'delegate',
      label: 'Delegate Address',
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{truncateAddress(value)}</span>
          <a
            href={`https://snapshot.org/#/profile/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
      sortable: false
    },
    {
      key: 'delegatedVotes',
      label: 'Voting Power',
      render: (value) => (
        <span className="font-semibold text-blue-600">
          {formatVotingPower(value || 0)}
        </span>
      )
    },
    {
      key: 'delegators',
      label: 'Delegators',
      render: (value) => (
        <span className="text-gray-700">{value || 0}</span>
      )
    },
    {
      key: 'shareOfTotal',
      label: 'Share',
      render: (value, row, index, data) => {
        const totalVP = data.reduce((sum, d) => sum + (d.delegatedVotes || 0), 0);
        const share = totalVP > 0 ? ((row.delegatedVotes || 0) / totalVP * 100) : 0;
        return (
          <Badge variant={share > 10 ? 'warning' : 'info'}>
            {share.toFixed(1)}%
          </Badge>
        );
      },
      sortable: false
    }
  ];

  const topDelegates = delegates.slice(0, maxDelegates);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Delegates</h3>
        <Badge variant="info">{topDelegates.length} delegates</Badge>
      </div>

      <DataTable
        columns={columns}
        data={topDelegates}
        defaultSortKey="delegatedVotes"
      />
    </div>
  );
}
