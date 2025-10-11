import { useState, useEffect } from 'react';
import { fetchAllProtocolData, calculateTreasuryMetrics } from '../services/cowProtocolDataService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from CoW Protocol API and Safe
 * NOTE: Using CoW Protocol REST API as primary data source (subgraph deprecated)
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

      console.log('[TreasuryData] Fetching from CoW Protocol API and Safe APIs...');

      // Fetch from both CoW Protocol API and Safe APIs - allow partial failures
      const [cowProtocolData, safeData] = await Promise.all([
        getCachedTreasury(() => fetchAllProtocolData('mainnet')).catch(err => {
          console.error('[TreasuryData] CoW Protocol API fetch failed:', err);
          return null;
        }),
        calculateTotalTreasuryValue().catch(err => {
          console.error('[TreasuryData] Safe data fetch failed:', err);
          return { totalUsd: 0, composition: {}, safes: [] };
        })
      ]);

      console.log('[TreasuryData] Data fetched successfully');

      // Calculate treasury metrics from CoW Protocol API data
      const treasuryMetrics = cowProtocolData ? calculateTreasuryMetrics(cowProtocolData) : null;

      // Check if we have any data
      const hasAnyData = (safeData?.totalUsd > 0) || (treasuryMetrics?.totalVolume > 0);
      
      if (!hasAnyData) {
        console.warn('[TreasuryData] No data available from CoW Protocol API or Safe');
        setError('No treasury data available. The API may be temporarily unavailable.');
        setData(null);
        setLastUpdated(new Date());
        return;
      }

      // Combine data from both sources
      setData({
        // Treasury holdings from Safe
        totalValue: safeData?.totalUsd || 0,
        composition: safeData?.composition || {},
        safes: safeData?.safes || [],
        
        // Protocol metrics from CoW Protocol API
        protocolMetrics: treasuryMetrics,
        totalFeesCollected: treasuryMetrics?.totalFeesCollected || 0,
        totalVolume: treasuryMetrics?.totalVolume || 0,
        totalTrades: treasuryMetrics?.totalTrades || 0,
        dailyRevenue: treasuryMetrics?.dailyRevenue || [],
        topTokens: treasuryMetrics?.topTokens || [],
        recentSolvers: treasuryMetrics?.recentSolvers || [],
        
        // Raw protocol data for detailed views
        protocolData: cowProtocolData,
        
        source: 'CoW Protocol API + Safe'
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('[TreasuryData] Error fetching treasury data:', err);
      setError(err.message || 'Failed to fetch treasury data from APIs');
      setData(null);
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
