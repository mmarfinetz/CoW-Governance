import { useState, useEffect } from 'react';
import { fetchAllDuneData } from '../services/duneService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from multiple sources
 */
export function useTreasuryData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching treasury data from Safe and Dune APIs...');

      // Fetch from both Dune and Safe APIs
      const [duneData, safeData] = await Promise.all([
        getCachedTreasury(() => fetchAllDuneData()).catch(err => {
          console.error('Dune data fetch failed:', err);
          throw new Error(`Dune API error: ${err.message}`);
        }),
        calculateTotalTreasuryValue().catch(err => {
          console.error('Safe data fetch failed:', err);
          throw new Error(`Safe API error: ${err.message}`);
        })
      ]);

      console.log('Treasury data fetched successfully:', { duneData, safeData });

      // Only set data if we actually got real data
      if (!safeData.totalUsd && !duneData.treasury.totalValue) {
        throw new Error('No treasury data available from APIs');
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
