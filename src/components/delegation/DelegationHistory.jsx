import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { fetchDelegationHistory } from '../../services/delegationService';
import { getCachedDelegationHistory } from '../../services/cacheService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { DataTable } from '../shared/DataTable';

export function DelegationHistory({ address }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCachedDelegationHistory(
          address,
          () => fetchDelegationHistory(address)
        );
        setHistory(data || []);
      } catch (err) {
        console.error('Error loading delegation history:', err);
        setError('Failed to load delegation history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [address]);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delegation History
        </h3>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delegation History
        </h3>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delegation History
        </h3>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No delegation history found for this address</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Date',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(value)}</div>
          <div className="text-xs text-gray-500">{formatTime(value)}</div>
        </div>
      )
    },
    {
      key: 'delegator',
      label: 'From (Delegator)',
      render: (value) => (
        <div className="flex items-center">
          <code className="text-sm font-mono text-gray-900">
            {formatAddress(value)}
          </code>
          <a
            href={`https://snapshot.org/#/profile/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
      sortable: false
    },
    {
      key: 'delegate',
      label: 'To (Delegate)',
      render: (value) => (
        <div className="flex items-center">
          <code className="text-sm font-mono text-gray-900">
            {formatAddress(value)}
          </code>
          <a
            href={`https://snapshot.org/#/profile/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      ),
      sortable: false
    },
    {
      key: 'space',
      label: 'Space',
      render: (value) => (
        <div className="text-sm text-gray-600">{value}</div>
      ),
      sortable: false
    },
    {
      key: 'id',
      label: 'Verification',
      render: (value, row) => (
        <a
          href={`https://snapshot.org/#/delegate/${row.space}/${row.delegator}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          View
          <ExternalLink size={12} className="ml-1" />
        </a>
      ),
      sortable: false
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Delegation History
        </h3>
        <div className="text-sm text-gray-500">
          {history.length} {history.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Complete delegation history for this address in CoW DAO governance.
      </p>

      <DataTable
        columns={columns}
        data={history}
        defaultSortKey="timestamp"
        defaultSortDirection="desc"
      />

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start text-sm text-gray-500">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>
            Delegation history is retrieved from Snapshot GraphQL API. All delegations are verified on-chain.
          </p>
        </div>
      </div>
    </div>
  );
}
