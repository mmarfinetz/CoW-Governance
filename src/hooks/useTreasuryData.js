import { useState, useEffect } from 'react';
import { fetchAllDuneData } from '../services/duneService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from multiple sources
 */
export function useTreasuryData(shouldFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching treasury data from Safe and Dune APIs...');

      // Fetch from both Dune and Safe APIs - allow partial failures
      const [duneData, safeData] = await Promise.all([
        getCachedTreasury(() => fetchAllDuneData()).catch(err => {
          console.error('Dune data fetch failed (partial data may still load):', err);
          return { treasury: { totalValue: 0, composition: [] }, revenue: {}, solverRewards: {}, solverInfo: {} };
        }),
        calculateTotalTreasuryValue().catch(err => {
          console.error('Safe data fetch failed (using Dune as fallback):', err);
          return { totalUsd: 0, composition: {}, safes: [] };
        })
      ]);

      console.log('Treasury data fetched (may be partial):', { duneData, safeData });

      // Accept partial data - don't require all queries to succeed
      const hasAnyData = (safeData.totalUsd > 0) || (duneData.treasury && duneData.treasury.totalValue > 0);
      
      if (!hasAnyData) {
        console.warn('No treasury data available from any source');
      }

      // Combine data from both sources - ALL REAL DATA
      setData({
        totalValue: safeData.totalUsd || duneData.treasury.totalValue,
        composition: safeData.composition,
        safes: safeData.safes,
        duneData: duneData,
        source: safeData.totalUsd > 0 ? 'Safe + Dune' : 'Dune'
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching treasury data:', err);
      setError(err.message || 'Failed to fetch treasury data from APIs');
      setData(null); // NO fallback data
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
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
