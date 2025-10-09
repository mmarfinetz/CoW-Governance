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

  const { filterByTimeRange, dateRange } = useTimeRange();

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

      // Convert voting period and delay from seconds to days
      const votingPeriodSeconds = spaceInfo.voting?.period || 604800; // Default: 7 days in seconds
      const votingDelaySeconds = spaceInfo.voting?.delay || 259200; // Default: 3 days in seconds
      
      setData({
        proposals: filteredProposals,
        allProposals: proposals, // Keep unfiltered for reference
        spaceInfo,
        metrics,
        quorum: spaceInfo.voting?.quorum || 35000000,
        votingPeriod: Math.round(votingPeriodSeconds / 86400), // Convert seconds to days
        votingDelay: Math.round(votingDelaySeconds / 86400) // Convert seconds to days
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
