import { useState, useEffect } from 'react';
import { fetchSolverRewardsData, fetchSolverInfoData } from '../services/duneService';
import { fetchProtocolMetrics } from '../services/cowProtocolService';
import { getCachedSolverMetrics } from '../services/cacheService';

/**
 * Hook to fetch and manage solver competition data
 */
export function useSolverData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const solverData = await getCachedSolverMetrics(async () => {
        const [rewards, info, protocolMetrics] = await Promise.all([
          fetchSolverRewardsData().catch(err => {
            console.error('Failed to fetch solver rewards:', err);
            return { totalRewards: 0, solvers: [] };
          }),
          fetchSolverInfoData().catch(err => {
            console.error('Failed to fetch solver info:', err);
            return { activeSolvers: 0, solverMetrics: [] };
          }),
          fetchProtocolMetrics().catch(err => {
            console.error('Failed to fetch protocol metrics:', err);
            return { health: { healthy: false }, surplus: 0 };
          })
        ]);

        return {
          rewards,
          info,
          protocolMetrics
        };
      });

      setData(solverData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching solver data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
