import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { fetchVotesByAddress } from '../../services/delegationService';
import { getCachedDelegateVotes } from '../../services/cacheService';
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
        const votes = await getCachedDelegateVotes(
          address,
          () => fetchVotesByAddress(address, 100)
        );
        setHistory(votes || []);
      } catch (err) {
        console.error('Error loading voting history:', err);
        setError('Failed to load voting history');
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
          Voting History
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
          Voting History
        </h3>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Voting History
        </h3>
        <div className="flex items-center justify-center py-8 text-gray-500">
          <div className="text-center">
            <Clock size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No voting history found for this address</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'created',
      label: 'Date',
      render: (value) => (
        <div>
          <div className="font-medium text-gray-900">{formatDate(value)}</div>
          <div className="text-xs text-gray-500">{formatTime(value)}</div>
        </div>
      )
    },
    {
      key: 'proposal',
      label: 'Proposal',
      render: (value) => (
        <div className="flex items-center">
          <span className="text-sm text-gray-900 truncate max-w-xs">{value?.title || value?.id}</span>
          {value?.id && (
            <a
              href={`https://snapshot.org/#/${value.space || 'cow.eth'}/proposal/${value.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      ),
      sortable: false
    },
    {
      key: 'choice',
      label: 'Choice'
    },
    {
      key: 'vp',
      label: 'Voting Power'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Voting History</h3>
        <div className="text-sm text-gray-500">{history.length} {history.length === 1 ? 'vote' : 'votes'}</div>
      </div>

      <p className="text-sm text-gray-600 mb-4">Recent votes for this address in CoW DAO governance.</p>

      <DataTable columns={columns} data={history} defaultSortKey="created" defaultSortDirection="desc" />

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start text-sm text-gray-500">
          <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>Voting history is retrieved from Snapshot GraphQL API.</p>
        </div>
      </div>
    </div>
  );
}
