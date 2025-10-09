/**
 * Data Discrepancy Warning Component
 *
 * Displays a warning banner when variance between data sources exceeds threshold.
 * Never suppresses discrepancies - always shows them to maintain transparency.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink, Info } from 'lucide-react';

export function DataDiscrepancyWarning({
  comparison,
  threshold = 5,
  onLearnMore,
  onDismiss
}) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no comparison data or variance is below threshold
  if (!comparison || !comparison.sources) return null;

  const { variance, status, message, sources } = comparison;

  // Check if we should show the warning
  const shouldShow =
    !dismissed &&
    (variance > threshold || status === 'warning' || status === 'error');

  if (!shouldShow) return null;

  // Determine warning severity
  const getSeverity = () => {
    if (status === 'error') return 'error';
    if (variance > 10) return 'high';
    if (variance > 5) return 'medium';
    return 'low';
  };

  const severity = getSeverity();

  // Styling based on severity
  const severityStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: 'text-red-500',
      button: 'bg-red-100 hover:bg-red-200 text-red-700'
    },
    high: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-800',
      icon: 'text-orange-500',
      button: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      icon: 'text-yellow-500',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
    },
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    }
  };

  const styles = severityStyles[severity];

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <AlertTriangle className={`${styles.icon} flex-shrink-0 mt-0.5`} size={20} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className={`font-semibold ${styles.text} mb-1`}>
                {severity === 'error'
                  ? 'Data Source Error Detected'
                  : 'Data Discrepancy Detected'}
              </h4>
              <p className={`text-sm ${styles.text}`}>{message}</p>

              {/* Data Comparison */}
              {Object.keys(sources).length > 0 && (
                <div className="mt-3 space-y-2">
                  {Object.entries(sources).map(([source, data]) => (
                    <div
                      key={source}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${styles.text} capitalize`}>
                          {source}:
                        </span>
                        <span className={styles.text}>
                          {typeof data.value === 'number'
                            ? data.value.toLocaleString()
                            : data.value}
                        </span>
                      </div>
                      {data.url && (
                        <a
                          href={data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 ${styles.button} px-2 py-1 rounded text-xs transition`}
                          title="View source"
                        >
                          <ExternalLink size={12} />
                          Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variance Display */}
              {variance > 0 && (
                <div className="mt-2">
                  <span className={`text-sm font-semibold ${styles.text}`}>
                    Variance: {variance.toFixed(2)}%
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                {onLearnMore && (
                  <button
                    onClick={onLearnMore}
                    className={`flex items-center gap-1 ${styles.button} px-3 py-1.5 rounded font-medium text-sm transition`}
                  >
                    <Info size={14} />
                    Learn More
                  </button>
                )}
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className={`${styles.icon} hover:opacity-70 transition flex-shrink-0`}
              aria-label="Dismiss warning"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="mt-3 pt-3 border-t border-current opacity-50">
        <p className={`text-xs ${styles.text}`}>
          This dashboard maintains full transparency by showing all data discrepancies.
          Variances may occur due to timing differences, data aggregation methods, or API
          rate limits.
        </p>
      </div>
    </div>
  );
}

/**
 * Multiple Discrepancies Container
 *
 * Displays multiple warnings in a stacked layout
 */
export function DataDiscrepancyWarnings({ comparisons, threshold = 5, onLearnMore }) {
  if (!comparisons || Object.keys(comparisons).length === 0) return null;

  // Filter comparisons that have warnings
  const warnings = Object.entries(comparisons)
    .filter(([, comparison]) => {
      if (!comparison) return false;
      const hasVariance = comparison.variance > threshold;
      const hasWarning = comparison.status === 'warning' || comparison.status === 'error';
      return hasVariance || hasWarning;
    })
    .map(([key, comparison]) => ({ key, comparison }));

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.map(({ key, comparison }) => (
        <DataDiscrepancyWarning
          key={key}
          comparison={comparison}
          threshold={threshold}
          onLearnMore={onLearnMore}
        />
      ))}
    </div>
  );
}
