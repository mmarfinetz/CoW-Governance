import { useState, useEffect } from 'react';
import { fetchAllProtocolData, calculateTreasuryMetrics } from '../services/subgraphService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from Subgraph (source of truth) and Safe
 * NOTE: Using CoW Protocol Subgraph as primary data source per project requirements
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

      console.log('[TreasuryData] Fetching from Subgraph (source of truth) and Safe APIs...');

      // Fetch from both Subgraph and Safe APIs - allow partial failures
      const [subgraphData, safeData] = await Promise.all([
        getCachedTreasury(() => fetchAllProtocolData('mainnet')).catch(err => {
          console.error('[TreasuryData] Subgraph data fetch failed:', err);
          return null;
        }),
        calculateTotalTreasuryValue().catch(err => {
          console.error('[TreasuryData] Safe data fetch failed:', err);
          return { totalUsd: 0, composition: {}, safes: [] };
        })
      ]);

      console.log('[TreasuryData] Data fetched successfully');

      // Calculate treasury metrics from subgraph data
      const treasuryMetrics = subgraphData ? calculateTreasuryMetrics(subgraphData) : null;

      // Check if we have any data
      const hasAnyData = (safeData?.totalUsd > 0) || (treasuryMetrics?.totalFeesCollected > 0);
      
      if (!hasAnyData) {
        console.warn('[TreasuryData] No data available from Subgraph or Safe');
        setError('No treasury data available. The subgraph may be temporarily unavailable.');
        setData(null);
        setLastUpdated(new Date());
        return;
      }

      // Combine data from both sources - Subgraph as source of truth
      setData({
        // Treasury holdings from Safe
        totalValue: safeData?.totalUsd || 0,
        composition: safeData?.composition || {},
        safes: safeData?.safes || [],
        
        // Protocol metrics from Subgraph (source of truth)
        protocolMetrics: treasuryMetrics,
        totalFeesCollected: treasuryMetrics?.totalFeesCollected || 0,
        totalVolume: treasuryMetrics?.totalVolume || 0,
        totalTrades: treasuryMetrics?.totalTrades || 0,
        dailyRevenue: treasuryMetrics?.dailyRevenue || [],
        topTokens: treasuryMetrics?.topTokens || [],
        
        // Raw subgraph data for detailed views
        subgraphData: subgraphData,
        
        source: 'Subgraph + Safe'
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
