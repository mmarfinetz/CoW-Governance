import { useState, useEffect } from 'react';
import { fetchProposals, fetchSpaceInfo, calculateGovernanceMetrics } from '../services/snapshotService';
import { getCachedProposals } from '../services/cacheService';
import { useTimeRange } from '../contexts/TimeRangeContext';

/**
 * Hook to fetch and manage governance data from Snapshot
 */
export function useGovernanceData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { filterByTimeRange } = useTimeRange();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [proposals, spaceInfo] = await Promise.all([
        getCachedProposals(() => fetchProposals(100)),
        fetchSpaceInfo()
      ]);

      // Filter proposals by selected time range
      const filteredProposals = filterByTimeRange(proposals, 'created');

      // Calculate metrics on filtered proposals
      const metrics = calculateGovernanceMetrics(filteredProposals);

      setData({
        proposals: filteredProposals,
        allProposals: proposals, // Keep unfiltered for reference
        spaceInfo,
        metrics,
        quorum: spaceInfo.voting?.quorum || 35000000,
        votingPeriod: spaceInfo.voting?.period || 7,
        votingDelay: spaceInfo.voting?.delay || 3
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching governance data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterByTimeRange]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
