/**
 * Methodology Modal Component
 *
 * Displays comprehensive methodology documentation for all dashboard metrics.
 * Shows formulas, data sources, update frequencies, and calculation methods.
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Info, ExternalLink } from 'lucide-react';
import {
  METRIC_DEFINITIONS,
  getCategories,
  searchMetrics
} from '../../config/metricDefinitions';

export function MethodologyModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => getCategories(), []);

  // Filter metrics based on search and category
  const filteredMetrics = useMemo(() => {
    let metrics = searchQuery
      ? searchMetrics(searchQuery)
      : METRIC_DEFINITIONS;

    if (selectedCategory !== 'all') {
      metrics = Object.entries(metrics)
        .filter(([, def]) => def.category === selectedCategory)
        .reduce((acc, [key, def]) => {
          acc[key] = def;
          return acc;
        }, {});
    }

    return metrics;
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Info className="text-blue-600" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Methodology Documentation</h2>
              <p className="text-sm text-gray-600">
                Complete transparency on how metrics are calculated
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close methodology modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="border-b border-gray-200 px-6 py-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search metrics by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Metrics
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition capitalize ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Metrics List (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {Object.entries(filteredMetrics).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search size={48} className="mx-auto mb-4 opacity-30" />
                <p>No metrics found matching your search.</p>
              </div>
            ) : (
              Object.entries(filteredMetrics).map(([key, definition]) => (
                <MetricDefinitionCard key={key} metricKey={key} definition={definition} />
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {Object.entries(filteredMetrics).length} metric
              {Object.entries(filteredMetrics).length !== 1 ? 's' : ''} displayed
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual metric definition card
 */
function MetricDefinitionCard({ metricKey, definition }) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors = {
    governance: 'blue',
    token: 'green',
    treasury: 'purple',
    solver: 'orange'
  };

  const color = categoryColors[definition.category] || 'gray';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{definition.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-${color}-100 text-${color}-700`}
            >
              {definition.category}
            </span>
          </div>
          <p className="text-sm text-gray-600">{definition.calculation}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {/* Basic Info (Always Visible) */}
      <div className="space-y-1 text-sm">
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-700 min-w-[100px]">Formula:</span>
          <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
            {definition.formula}
          </code>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-700 min-w-[100px]">Source:</span>
          <span className="flex-1 text-gray-600">{definition.source}</span>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 min-w-[100px]">Endpoint:</span>
            <div className="flex-1">
              <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded break-all">
                {definition.endpoint}
              </code>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 min-w-[100px]">Updates:</span>
            <span className="flex-1 text-gray-600">{definition.updateFrequency}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 min-w-[100px]">Unit:</span>
            <span className="flex-1 text-gray-600">{definition.unit}</span>
          </div>
          {definition.alternativeSource && (
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-700 min-w-[100px]">Alternative:</span>
              <span className="flex-1 text-gray-600">{definition.alternativeSource}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
