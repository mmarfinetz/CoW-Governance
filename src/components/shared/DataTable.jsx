import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * DataTable component for displaying tabular data with sorting
 */
export function DataTable({ columns, data, defaultSortKey, className = '' }) {
  const [sortKey, setSortKey] = useState(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <div className={`bg-cow-brown bg-opacity-60 backdrop-blur-sm rounded-cow shadow-lg overflow-hidden border border-cow-brown-light ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-cow-brown-light">
          <thead className="bg-cow-brown-dark">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-cow-brown-medium transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable !== false && sortKey === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp size={14} className="ml-1" />
                      ) : (
                        <ChevronDown size={14} className="ml-1" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-cow-brown bg-opacity-40 divide-y divide-cow-brown-light">
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-cow-brown-medium transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-cow-pink-light">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
