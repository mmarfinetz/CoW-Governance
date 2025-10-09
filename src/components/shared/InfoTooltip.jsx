import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { getMetricDefinition } from '../../config/metricDefinitions';

/**
 * InfoTooltip component for displaying additional information
 *
 * @param {String} content - Custom tooltip content (used if no metric provided)
 * @param {String} metric - Metric key to show definition from metricDefinitions
 * @param {String} position - Tooltip position (top, bottom, left, right)
 */
export function InfoTooltip({ content, metric, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Get metric definition if metric key provided
  const metricDef = metric ? getMetricDefinition(metric) : null;

  // Determine tooltip content
  let tooltipContent;
  if (metricDef) {
    tooltipContent = (
      <div className="max-w-xs whitespace-normal">
        <div className="font-semibold mb-1">{metricDef.name}</div>
        <div className="text-xs opacity-90 mb-2">{metricDef.calculation}</div>
        <div className="text-xs opacity-75 border-t border-gray-700 pt-1 mt-1">
          <div><strong>Formula:</strong> {metricDef.formula}</div>
          <div className="mt-1"><strong>Source:</strong> {metricDef.source}</div>
          <div className="mt-1"><strong>Updates:</strong> {metricDef.updateFrequency}</div>
        </div>
      </div>
    );
  } else {
    tooltipContent = content;
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600 transition"
        aria-label={metricDef ? `Info about ${metricDef.name}` : 'More information'}
      >
        <Info size={16} />
      </button>
      {show && (
        <div
          className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg ${
            metricDef ? 'whitespace-normal' : 'whitespace-nowrap'
          } ${positionClasses[position]}`}
        >
          {tooltipContent}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1' :
            position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1' :
            position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1' :
            'left-0 top-1/2 -translate-y-1/2 -translate-x-1'
          }`}></div>
        </div>
      )}
    </div>
  );
}
