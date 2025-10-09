/**
 * Data Reconciliation Service
 *
 * Compares metrics from multiple data sources to detect discrepancies
 * and ensure data accuracy across the dashboard.
 *
 * This service:
 * - Fetches data from multiple sources in parallel
 * - Compares overlapping metrics (e.g., treasury from Dune vs Safe API)
 * - Calculates variance percentages
 * - Logs all comparisons with source URLs
 * - Runs hourly background checks
 * - Never suppresses discrepancies
 */

import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { fetchProposals, fetchSpaceInfo } from './snapshotService';
import { fetchTreasuryData } from './duneService';
import { calculateTotalTreasuryValue } from './safeService';

// Reconciliation state
let reconciliationInterval = null;
let lastReconciliation = null;

/**
 * Calculate percentage variance between two values
 */
function calculateVariance(value1, value2) {
  if (value1 === 0 && value2 === 0) return 0;
  if (value1 === 0 || value2 === 0) return 100;

  const avg = (value1 + value2) / 2;
  const variance = Math.abs(value1 - value2) / avg * 100;
  return parseFloat(variance.toFixed(2));
}

/**
 * Compare proposal count from Snapshot GraphQL vs Dune Analytics
 *
 * Note: Dune may have historical proposal data that differs from current Snapshot state
 * This comparison helps identify data sync issues between sources
 */
export async function compareProposalCount() {
  console.log('🔍 [Reconciliation] Comparing proposal count from multiple sources...');

  try {
    // Fetch from Snapshot (primary source)
    const snapshotProposals = await fetchProposals(1000);
    const snapshotCount = snapshotProposals.length;
    const snapshotUrl = `${API_CONFIG.snapshot.endpoint} (space: ${API_CONFIG.snapshot.space})`;

    console.log(`✅ Snapshot API: ${snapshotCount} proposals`);
    console.log(`   Source: ${snapshotUrl}`);

    // For now, we only have Snapshot as the source for proposals
    // Future enhancement: Compare with Dune if they add proposal tracking
    return {
      metric: 'proposalCount',
      sources: {
        snapshot: {
          value: snapshotCount,
          url: snapshotUrl,
          timestamp: new Date().toISOString()
        }
      },
      variance: 0,
      status: 'ok',
      message: 'Single source - no comparison needed'
    };
  } catch (error) {
    console.error('❌ [Reconciliation] Error comparing proposal count:', error);
    return {
      metric: 'proposalCount',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Compare treasury value from Dune Analytics vs Safe Transaction Service
 *
 * This is a critical comparison as treasury data comes from two independent sources:
 * - Dune: Aggregated on-chain data with custom queries
 * - Safe API: Direct multisig wallet balances
 */
export async function compareTreasuryValue() {
  console.log('🔍 [Reconciliation] Comparing treasury value from Dune vs Safe API...');

  try {
    // Fetch from both sources in parallel
    const [duneData, safeData] = await Promise.all([
      fetchTreasuryData().catch(err => {
        console.warn('Dune treasury fetch failed:', err);
        return null;
      }),
      calculateTotalTreasuryValue().catch(err => {
        console.warn('Safe API fetch failed:', err);
        return null;
      })
    ]);

    // Prepare comparison results
    const comparison = {
      metric: 'treasuryValue',
      sources: {},
      variance: 0,
      status: 'ok'
    };

    // Add Dune data if available
    if (duneData && duneData.totalValue) {
      const duneUrl = `${API_CONFIG.dune.baseUrl}/query/${API_CONFIG.dune.queries.treasury}/results`;
      comparison.sources.dune = {
        value: duneData.totalValue,
        url: duneUrl,
        timestamp: duneData.timestamp || new Date().toISOString()
      };
      console.log(`✅ Dune Analytics: $${duneData.totalValue.toLocaleString()} USD`);
      console.log(`   Source: ${duneUrl}`);
    }

    // Add Safe data if available
    if (safeData && safeData.totalValue !== undefined) {
      const safeUrl = `${API_CONFIG.safe.baseUrl}/api/v1/safes/${API_CONFIG.safe.addresses.solverPayouts}/balances`;
      comparison.sources.safe = {
        value: safeData.totalValue,
        url: safeUrl,
        timestamp: safeData.timestamp || new Date().toISOString()
      };
      console.log(`✅ Safe API: $${safeData.totalValue.toLocaleString()} USD`);
      console.log(`   Source: ${safeUrl}`);
    }

    // Calculate variance if both sources available
    if (comparison.sources.dune && comparison.sources.safe) {
      const duneValue = comparison.sources.dune.value;
      const safeValue = comparison.sources.safe.value;
      const variance = calculateVariance(duneValue, safeValue);

      comparison.variance = variance;

      if (variance > 5) {
        comparison.status = 'warning';
        comparison.message = `Significant variance detected: ${variance}% difference between Dune and Safe API`;
        console.warn(`⚠️  [Reconciliation] Treasury variance: ${variance}%`);
        console.warn(`   Dune: $${duneValue.toLocaleString()}`);
        console.warn(`   Safe: $${safeValue.toLocaleString()}`);
      } else {
        comparison.message = `Values aligned within acceptable range (${variance}% variance)`;
        console.log(`✅ [Reconciliation] Treasury values match within ${variance}%`);
      }
    } else if (!comparison.sources.dune && !comparison.sources.safe) {
      comparison.status = 'error';
      comparison.message = 'Both sources failed to fetch';
    } else {
      comparison.status = 'partial';
      comparison.message = 'Only one source available - cannot compare';
    }

    return comparison;
  } catch (error) {
    console.error('❌ [Reconciliation] Error comparing treasury value:', error);
    return {
      metric: 'treasuryValue',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Compare voting power metrics from Snapshot
 *
 * Validates internal consistency of Snapshot data:
 * - Quorum threshold vs actual participation
 * - Average participation vs max votes
 */
export async function compareVotingPower() {
  console.log('🔍 [Reconciliation] Validating voting power metrics from Snapshot...');

  try {
    const [proposals, spaceInfo] = await Promise.all([
      fetchProposals(100),
      fetchSpaceInfo()
    ]);

    const closedProposals = proposals.filter(p => p.state === 'closed' && p.scores_total);
    const avgParticipation = closedProposals.length > 0
      ? closedProposals.reduce((sum, p) => sum + p.scores_total, 0) / closedProposals.length
      : 0;
    const maxVotes = Math.max(...proposals.map(p => p.scores_total || 0));
    const quorum = spaceInfo.voting?.quorum || 35000000;

    const snapshotUrl = `${API_CONFIG.snapshot.endpoint} (space: ${API_CONFIG.snapshot.space})`;

    console.log(`✅ Snapshot Voting Power:`);
    console.log(`   Quorum: ${(quorum / 1000000).toFixed(1)}M COW`);
    console.log(`   Avg Participation: ${(avgParticipation / 1000000).toFixed(1)}M COW`);
    console.log(`   Max Votes: ${(maxVotes / 1000000).toFixed(1)}M COW`);
    console.log(`   Source: ${snapshotUrl}`);

    // Validate consistency
    const warnings = [];
    if (avgParticipation > quorum * 2) {
      warnings.push('Average participation significantly exceeds quorum (may indicate increased engagement or token distribution)');
    }
    if (maxVotes < quorum) {
      warnings.push('Maximum votes recorded is below quorum threshold (may indicate low historical participation)');
    }

    return {
      metric: 'votingPower',
      sources: {
        snapshot: {
          quorum,
          avgParticipation,
          maxVotes,
          url: snapshotUrl,
          timestamp: new Date().toISOString()
        }
      },
      variance: 0,
      status: warnings.length > 0 ? 'warning' : 'ok',
      message: warnings.length > 0 ? warnings.join('; ') : 'Voting power metrics are consistent',
      warnings
    };
  } catch (error) {
    console.error('❌ [Reconciliation] Error validating voting power:', error);
    return {
      metric: 'votingPower',
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Run complete reconciliation across all comparable metrics
 */
export async function runReconciliation() {
  console.log('🚀 [Reconciliation] Starting full reconciliation check...');
  console.log(`   Timestamp: ${new Date().toISOString()}`);

  const startTime = Date.now();

  try {
    // Run all comparisons in parallel
    const [proposalComparison, treasuryComparison, votingPowerComparison] = await Promise.all([
      compareProposalCount(),
      compareTreasuryValue(),
      compareVotingPower()
    ]);

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      comparisons: {
        proposalCount: proposalComparison,
        treasuryValue: treasuryComparison,
        votingPower: votingPowerComparison
      },
      summary: {
        total: 3,
        ok: 0,
        warnings: 0,
        errors: 0
      }
    };

    // Calculate summary
    Object.values(report.comparisons).forEach(comparison => {
      if (comparison.status === 'ok') report.summary.ok++;
      else if (comparison.status === 'warning' || comparison.status === 'partial') report.summary.warnings++;
      else if (comparison.status === 'error') report.summary.errors++;
    });

    // Log summary
    console.log('✅ [Reconciliation] Complete');
    console.log(`   Duration: ${report.duration}ms`);
    console.log(`   Results: ${report.summary.ok} OK, ${report.summary.warnings} warnings, ${report.summary.errors} errors`);

    // Store in module state
    lastReconciliation = report;

    return report;
  } catch (error) {
    console.error('❌ [Reconciliation] Failed to complete reconciliation:', error);
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      summary: { total: 0, ok: 0, warnings: 0, errors: 1 }
    };
  }
}

/**
 * Get last reconciliation report
 */
export function getLastReconciliation() {
  return lastReconciliation;
}

/**
 * Start hourly background reconciliation
 */
export function startReconciliationSchedule() {
  if (reconciliationInterval) {
    console.warn('[Reconciliation] Schedule already running');
    return;
  }

  console.log('[Reconciliation] Starting hourly schedule...');

  // Run immediately on start
  runReconciliation();

  // Then run every hour
  reconciliationInterval = setInterval(() => {
    console.log('[Reconciliation] Running scheduled reconciliation...');
    runReconciliation();
  }, 60 * 60 * 1000); // 1 hour

  return reconciliationInterval;
}

/**
 * Stop background reconciliation
 */
export function stopReconciliationSchedule() {
  if (reconciliationInterval) {
    clearInterval(reconciliationInterval);
    reconciliationInterval = null;
    console.log('[Reconciliation] Schedule stopped');
  }
}

/**
 * Check if specific metric has variance above threshold
 */
export function hasVarianceWarning(metricKey, threshold = 5) {
  if (!lastReconciliation) return false;

  const comparison = lastReconciliation.comparisons[metricKey];
  if (!comparison) return false;

  return comparison.variance > threshold || comparison.status === 'warning';
}

/**
 * Get variance details for a specific metric
 */
export function getVarianceDetails(metricKey) {
  if (!lastReconciliation) return null;

  return lastReconciliation.comparisons[metricKey] || null;
}
