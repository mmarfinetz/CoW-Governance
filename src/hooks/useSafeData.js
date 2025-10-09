import { useState, useEffect } from 'react';
import { fetchAllCoWDAOSafes, fetchSolverPayoutsSafe } from '../services/safeService';
import { getCachedSafeBalances } from '../services/cacheService';

/**
 * Hook to fetch and manage Safe multisig data
 */
export function useSafeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const safeData = await getCachedSafeBalances(async () => {
        const [allSafes, solverPayouts] = await Promise.all([
          fetchAllCoWDAOSafes().catch(err => {
            console.error('Failed to fetch all Safes:', err);
            return [];
          }),
          fetchSolverPayoutsSafe().catch(err => {
            console.error('Failed to fetch solver payouts Safe:', err);
            return null;
          })
        ]);

        return {
          safes: allSafes,
          solverPayouts
        };
      });

      setData(safeData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching Safe data:', err);
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
