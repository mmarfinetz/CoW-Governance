import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const SNAPSHOT_API = API_CONFIG.snapshot.endpoint;
const COW_SPACE = API_CONFIG.snapshot.space;

/**
 * Fetch top delegates from Snapshot
 * NOTE: The delegation query may not be available in the current Snapshot GraphQL API
 * This is a known limitation - delegation data may need to come from a different source
 */
async function fetchTopDelegates(first = 100) {
  const query = `
    query Delegates {
      delegates(
        first: ${first},
        where: { space: "${COW_SPACE}" },
        orderBy: delegatedVotes,
        orderDirection: desc
      ) {
        id
        delegatedVotes
        delegators
      }
    }
  `;

  try {
    const response = await axios.post(SNAPSHOT_API, { query });
    const delegates = response.data.data?.delegates || [];
    console.log('[DelegationService] Fetched', delegates.length, 'delegates');
    return delegates;
  } catch (error) {
    console.error('Error fetching delegates from Snapshot:', error.response?.data || error.message);
    
    // Provide more helpful error message
    if (error.response?.status === 400) {
      throw new Error('Snapshot API returned 400 error. The delegation query schema may have changed or this endpoint may no longer be available. Check Snapshot API documentation for current schema.');
    }
    throw error;
  }
}

/**
 * Calculate delegation metrics
 */
function calculateDelegationMetrics(delegates) {
  if (!delegates || delegates.length === 0) {
    return {
      totalDelegatedPower: 0,
      totalDelegators: 0,
      averageDelegationSize: 0,
      topDelegateShare: 0,
      delegationConcentration: 0
    };
  }

  const totalDelegatedPower = delegates.reduce((sum, d) => sum + (d.delegatedVotes || 0), 0);
  const totalDelegators = delegates.reduce((sum, d) => sum + (d.delegators || 0), 0);
  const averageDelegationSize = totalDelegators > 0 ? totalDelegatedPower / totalDelegators : 0;
  const topDelegateShare = delegates.length > 0 && totalDelegatedPower > 0
    ? (delegates[0].delegatedVotes / totalDelegatedPower) * 100
    : 0;

  // Calculate Gini coefficient (delegation concentration)
  // Simplified calculation: ratio of top 10% to total
  const top10Count = Math.ceil(delegates.length * 0.1);
  const top10Power = delegates.slice(0, top10Count).reduce((sum, d) => sum + (d.delegatedVotes || 0), 0);
  const delegationConcentration = totalDelegatedPower > 0 ? (top10Power / totalDelegatedPower) * 100 : 0;

  return {
    totalDelegatedPower,
    totalDelegators,
    averageDelegationSize,
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

      const delegateData = await fetchTopDelegates(100);

      // Sort by delegated votes descending
      const sortedDelegates = delegateData.sort((a, b) =>
        (b.delegatedVotes || 0) - (a.delegatedVotes || 0)
      );

      const calculatedMetrics = calculateDelegationMetrics(sortedDelegates);

      setDelegates(sortedDelegates);
      setMetrics(calculatedMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching delegation data:', err);
      setError(err.message);
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
