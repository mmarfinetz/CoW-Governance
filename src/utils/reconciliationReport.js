/**
 * Reconciliation Report Utility
 *
 * Manages reconciliation report generation, storage, and export.
 * Reports are stored in localStorage for historical tracking.
 */

const STORAGE_KEY = 'cow_dao_reconciliation_reports';
const MAX_STORED_REPORTS = 50; // Keep last 50 reports

/**
 * Generate a downloadable reconciliation report
 *
 * @param {Object} reconciliationData - The reconciliation data from runReconciliation()
 * @returns {Object} Formatted report ready for export
 */
export function generateReconciliationReport(reconciliationData) {
  if (!reconciliationData) {
    throw new Error('No reconciliation data provided');
  }

  const report = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    dashboard: 'CoW DAO Governance Dashboard',
    reconciliation: {
      timestamp: reconciliationData.timestamp,
      duration: reconciliationData.duration,
      summary: reconciliationData.summary
    },
    comparisons: {},
    metadata: {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    }
  };

  // Format each comparison with full details
  if (reconciliationData.comparisons) {
    Object.entries(reconciliationData.comparisons).forEach(([key, comparison]) => {
      report.comparisons[key] = {
        metric: comparison.metric,
        status: comparison.status,
        variance: comparison.variance || 0,
        message: comparison.message || '',
        sources: comparison.sources || {},
        warnings: comparison.warnings || [],
        error: comparison.error || null
      };
    });
  }

  return report;
}

/**
 * Save reconciliation report to localStorage
 *
 * @param {Object} report - The report to save
 */
export function saveReconciliationReport(report) {
  try {
    const storedReports = getReconciliationHistory();

    // Add new report at the beginning
    storedReports.unshift(report);

    // Keep only the most recent MAX_STORED_REPORTS
    const trimmedReports = storedReports.slice(0, MAX_STORED_REPORTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedReports));

    console.log(`📝 [Reconciliation] Report saved to localStorage (${trimmedReports.length} total)`);

    return true;
  } catch (error) {
    console.error('❌ [Reconciliation] Failed to save report:', error);
    return false;
  }
}

/**
 * Get reconciliation history from localStorage
 *
 * @returns {Array} Array of historical reconciliation reports
 */
export function getReconciliationHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const reports = JSON.parse(stored);
    return Array.isArray(reports) ? reports : [];
  } catch (error) {
    console.error('❌ [Reconciliation] Failed to load history:', error);
    return [];
  }
}

/**
 * Clear reconciliation history
 */
export function clearReconciliationHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️  [Reconciliation] History cleared');
    return true;
  } catch (error) {
    console.error('❌ [Reconciliation] Failed to clear history:', error);
    return false;
  }
}

/**
 * Download reconciliation report as JSON file
 *
 * @param {Object} report - The report to download
 * @param {String} filename - Optional custom filename
 */
export function downloadReconciliationReport(report, filename = null) {
  try {
    // Generate filename with timestamp if not provided
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const finalFilename = filename || `cow-dao-reconciliation-${timestamp}.json`;

    // Create blob and download link
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.click();

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);

    console.log(`💾 [Reconciliation] Report downloaded: ${finalFilename}`);

    return true;
  } catch (error) {
    console.error('❌ [Reconciliation] Failed to download report:', error);
    return false;
  }
}

/**
 * Get summary statistics from reconciliation history
 *
 * @returns {Object} Summary statistics
 */
export function getHistorySummary() {
  const history = getReconciliationHistory();

  if (history.length === 0) {
    return {
      totalReports: 0,
      avgVariance: 0,
      warningCount: 0,
      errorCount: 0,
      lastRun: null
    };
  }

  let totalWarnings = 0;
  let totalErrors = 0;
  let varianceSum = 0;
  let varianceCount = 0;

  history.forEach(report => {
    if (report.reconciliation?.summary) {
      totalWarnings += report.reconciliation.summary.warnings || 0;
      totalErrors += report.reconciliation.summary.errors || 0;
    }

    // Calculate average variance from comparisons
    if (report.comparisons) {
      Object.values(report.comparisons).forEach(comparison => {
        if (comparison.variance && comparison.variance > 0) {
          varianceSum += comparison.variance;
          varianceCount++;
        }
      });
    }
  });

  return {
    totalReports: history.length,
    avgVariance: varianceCount > 0 ? (varianceSum / varianceCount).toFixed(2) : 0,
    warningCount: totalWarnings,
    errorCount: totalErrors,
    lastRun: history[0]?.generatedAt || null
  };
}

/**
 * Get variance trend for a specific metric
 *
 * @param {String} metricKey - The metric to analyze
 * @param {Number} limit - Number of recent reports to analyze
 * @returns {Array} Array of variance values over time
 */
export function getVarianceTrend(metricKey, limit = 10) {
  const history = getReconciliationHistory().slice(0, limit);

  return history.map(report => ({
    timestamp: report.generatedAt,
    variance: report.comparisons?.[metricKey]?.variance || 0,
    status: report.comparisons?.[metricKey]?.status || 'unknown'
  })).reverse(); // Oldest first for charting
}

/**
 * Export all reconciliation history as a single JSON file
 */
export function exportAllHistory() {
  const history = getReconciliationHistory();

  if (history.length === 0) {
    console.warn('[Reconciliation] No history to export');
    return false;
  }

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalReports: history.length,
    reports: history
  };

  return downloadReconciliationReport(
    exportData,
    `cow-dao-reconciliation-history-${new Date().toISOString().slice(0, 10)}.json`
  );
}

/**
 * Find reports with variance above threshold
 *
 * @param {Number} threshold - Variance threshold percentage
 * @returns {Array} Reports with high variance
 */
export function findHighVarianceReports(threshold = 5) {
  const history = getReconciliationHistory();

  return history.filter(report => {
    if (!report.comparisons) return false;

    return Object.values(report.comparisons).some(
      comparison => comparison.variance && comparison.variance > threshold
    );
  });
}

/**
 * Get latest report for a specific metric
 *
 * @param {String} metricKey - The metric to retrieve
 * @returns {Object|null} Latest comparison data for the metric
 */
export function getLatestMetricReport(metricKey) {
  const history = getReconciliationHistory();

  if (history.length === 0) return null;

  const latest = history[0];
  return latest.comparisons?.[metricKey] || null;
}
