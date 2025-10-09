import React, { useState, useMemo } from 'react';
import { Copy, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatNumber } from '../../utils/csvExport';

/**
 * VoterTable component
 * Displays sortable, searchable, paginated table of voters
 */
export function VoterTable({ votes, choices }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('vp');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 50;

  // Copy address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format choice based on type
  const formatChoice = (choice) => {
    if (!choice) return 'N/A';

    if (typeof choice === 'number') {
      // Single choice - map to choice text
      return choices && choices[choice - 1] ? choices[choice - 1] : `Choice ${choice}`;
    }

    if (Array.isArray(choice)) {
      // Multiple choices
      return choice.map((c, idx) => {
        return choices && choices[c - 1] ? choices[c - 1] : `Choice ${c}`;
      }).join(', ');
    }

    return String(choice);
  };

  // Handle sorting
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Filter and sort votes
  const filteredAndSortedVotes = useMemo(() => {
    let filtered = votes;

    // Apply search filter
    if (searchTerm) {
      filtered = votes.filter(vote =>
        vote.voter.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aVal, bVal;

      if (sortKey === 'vp') {
        aVal = a.vp || 0;
        bVal = b.vp || 0;
      } else if (sortKey === 'created') {
        aVal = a.created || 0;
        bVal = b.created || 0;
      } else if (sortKey === 'voter') {
        aVal = a.voter || '';
        bVal = b.voter || '';
      } else {
        return 0;
      }

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [votes, searchTerm, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedVotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVotes = filteredAndSortedVotes.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by voter address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('voter')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Voter Address
                </th>
                <th
                  onClick={() => handleSort('vp')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Voting Power {sortKey === 'vp' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Choice
                </th>
                <th
                  onClick={() => handleSort('created')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Timestamp {sortKey === 'created' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedVotes.map((vote, index) => (
                <tr key={vote.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-mono">
                        {truncateAddress(vote.voter)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(vote.voter)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Copy address"
                      >
                        <Copy size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatNumber(vote.vp || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatChoice(vote.choice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {vote.created
                      ? new Date(vote.created * 1000).toLocaleString()
                      : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedVotes.length)} of {filteredAndSortedVotes.length} votes
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
