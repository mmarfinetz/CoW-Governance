import React, { useState } from 'react';
import { Search, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchDelegation, isValidAddress, isENSName } from '../../services/delegationService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { DelegationHistory } from './DelegationHistory';

export function DelegationLookup() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [delegation, setDelegation] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async () => {
    if (!address.trim()) {
      setError('Please enter an Ethereum address or ENS name');
      return;
    }

    // Basic validation
    const isAddress = isValidAddress(address);
    const isENS = isENSName(address);

    if (!isAddress && !isENS) {
      setError('Please enter a valid Ethereum address (0x...) or ENS name (.eth)');
      return;
    }

    setLoading(true);
    setError(null);
    setDelegation(null);
    setSearched(false);

    try {
      const result = await fetchDelegation(address.trim());
      setDelegation(result);
      setSearched(true);
    } catch (err) {
      console.error('Error looking up delegation:', err);
      setError('Failed to fetch delegation data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getSnapshotUrl = (addr) => {
    return `https://snapshot.org/#/profile/${addr}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Delegation Lookup
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter an Ethereum address or ENS name to check their current delegation status in CoW DAO governance.
        </p>

        {/* Input and Search Button */}
        <div className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="0x... or name.eth"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Searching...</span>
              </>
            ) : (
              <>
                <Search size={18} className="mr-2" />
                Lookup
              </>
            )}
          </button>
        </div>

        {/* Validation Hints */}
        <div className="mt-2 text-xs text-gray-500">
          Examples: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb or vitalik.eth
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onRetry={() => setError(null)} />
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {delegation ? (
            // Has Delegation
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle className="text-green-500 mr-3 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delegation Found
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This address has delegated their voting power.
                  </p>

                  {/* Delegation Details */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Delegator
                      </label>
                      <div className="flex items-center mt-1">
                        <code className="text-sm font-mono text-gray-900">
                          {formatAddress(delegation.delegator)}
                        </code>
                        <a
                          href={getSnapshotUrl(delegation.delegator)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Delegated To
                      </label>
                      <div className="flex items-center mt-1">
                        <code className="text-sm font-mono text-gray-900">
                          {formatAddress(delegation.delegate)}
                        </code>
                        <a
                          href={getSnapshotUrl(delegation.delegate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Full address: {delegation.delegate}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Delegation Date
                      </label>
                      <div className="text-sm text-gray-900 mt-1">
                        {new Date(delegation.timestamp * 1000).toLocaleDateString()} at{' '}
                        {new Date(delegation.timestamp * 1000).toLocaleTimeString()}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Space
                      </label>
                      <div className="text-sm text-gray-900 mt-1">
                        {delegation.space}
                      </div>
                    </div>
                  </div>

                  {/* Link to Snapshot */}
                  <div className="mt-4">
                    <a
                      href={`https://snapshot.org/#/delegate/${delegation.space}/${delegation.delegator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      View on Snapshot
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // No Delegation
            <div className="flex items-start">
              <AlertCircle className="text-amber-500 mr-3 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Delegation Found
                </h3>
                <p className="text-sm text-gray-600">
                  This address has not delegated their voting power in CoW DAO governance.
                  They can vote directly on proposals.
                </p>
                <div className="mt-4">
                  <a
                    href="https://snapshot.org/#/delegate/cow.eth"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    Delegate on Snapshot
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delegation History - only show if search was performed */}
      {searched && address && !loading && (
        <DelegationHistory address={address.trim()} />
      )}
    </div>
  );
}
