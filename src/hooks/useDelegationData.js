import { useState, useEffect } from 'react';
import { fetchAllDelegates, fetchVotesByAddress } from '../services/delegationService';

/**
 * Fetch delegates by aggregating delegation records from Snapshot
 * This intelligently builds the delegates list since Snapshot has no direct "delegates" query
 */
async function fetchTopDelegates(first = 1000) {
  try {
    console.log('[useDelegationData] Fetching delegates by aggregating delegation records...');

    // Use the intelligent aggregation service to build delegates list
    const delegates = await fetchAllDelegates(undefined, first);

    console.log('[useDelegationData] Successfully fetched', delegates.length, 'delegates');
    return delegates;
  } catch (error) {
    const details = error?.response?.data?.errors?.[0]?.message || error?.response?.data || error.message;
    console.error('[useDelegationData] Error fetching delegates:', details);
    throw new Error(`Failed to fetch delegates: ${details}`);
  }
}

/**
 * Calculate delegation metrics from aggregated delegate data
 */
function calculateDelegationMetrics(delegates) {
  if (!delegates || delegates.length === 0) {
    return {
      totalDelegatedPower: 0,
      totalDelegators: 0,
      totalDelegates: 0,
      averageDelegatorsPerDelegate: 0,
      topDelegateShare: 0,
      delegationConcentration: 0
    };
  }

  // Note: votingPower may not be available without additional API calls
  // For now, we use delegator count as a proxy for influence
  const totalDelegators = delegates.reduce((sum, d) => sum + (d.delegatorCount || 0), 0);
  const totalDelegatedPower = delegates.reduce((sum, d) => sum + (d.votingPower || 0), 0);
  const averageDelegatorsPerDelegate = delegates.length > 0 ? totalDelegators / delegates.length : 0;

  // Calculate concentration based on delegator count
  const topDelegateDelegators = delegates[0]?.delegatorCount || 0;
  const topDelegateShare = totalDelegators > 0 ? (topDelegateDelegators / totalDelegators) * 100 : 0;

  // Calculate concentration: ratio of top 10% to total
  const top10Count = Math.max(1, Math.ceil(delegates.length * 0.1));
  const top10Delegators = delegates.slice(0, top10Count).reduce((sum, d) => sum + (d.delegatorCount || 0), 0);
  const delegationConcentration = totalDelegators > 0 ? (top10Delegators / totalDelegators) * 100 : 0;

  return {
    totalDelegatedPower, // May be 0 if voting power not fetched
    totalDelegators,
    totalDelegates: delegates.length,
    averageDelegatorsPerDelegate,
    topDelegateShare,
    delegationConcentration
  };
}

/**
 * Hook to fetch delegation data from Snapshot
 */
export function useDelegationData(shouldFetch = true) {
  const [delegates, setDelegates] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useDelegationData] Starting delegate fetch...');
      const delegateData = await fetchTopDelegates(500);

      // Data is already sorted by delegator count from fetchAllDelegates
      // But we can re-sort if needed for other criteria
      const sortedDelegates = delegateData.sort((a, b) =>
        (b.delegatorCount || 0) - (a.delegatorCount || 0)
      );

      // Enrich top delegates with voting power (from recent votes)
      const ENRICH_COUNT = 30;
      const toEnrich = sortedDelegates.slice(0, ENRICH_COUNT);
      console.log(`[useDelegationData] Enriching top ${toEnrich.length} with voting power...`);
      const enrichedTop = await Promise.all(
        toEnrich.map(async (d) => {
          try {
            const votes = await fetchVotesByAddress(d.address, 100);
            const vpValues = votes.map(v => v.vp || 0).filter(v => v > 0);
            const votingPower = vpValues.length ? Math.max(...vpValues) : 0; // strongest recent VP
            return { ...d, votingPower, totalVotes: votes.length, recentVotes: votes.slice(0, 10) };
          } catch (e) {
            console.warn('[useDelegationData] Failed to enrich', d.address, e?.message || e);
            return { ...d };
          }
        })
      );
      const enrichedDelegates = [...enrichedTop, ...sortedDelegates.slice(ENRICH_COUNT)];

      console.log('[useDelegationData] Calculating metrics for', enrichedDelegates.length, 'delegates');
      const calculatedMetrics = calculateDelegationMetrics(enrichedDelegates);

      console.log('[useDelegationData] Metrics:', calculatedMetrics);

      setDelegates(enrichedDelegates);
      setMetrics(calculatedMetrics);
      setLastUpdated(new Date());

      console.log('[useDelegationData] Successfully updated state with', enrichedDelegates.length, 'delegates');
    } catch (err) {
      console.error('[useDelegationData] Error fetching delegation data:', err);
      setError(err.message || 'Failed to fetch delegation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [shouldFetch]);

  return {
    delegates,
    metrics,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
