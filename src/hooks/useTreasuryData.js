import { useState, useEffect } from 'react';
import { fetchAllDuneData } from '../services/duneService';
import { fetchAllProtocolData, calculateTreasuryMetrics } from '../services/subgraphService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from Dune Analytics (primary) and Safe
 * NOTE: Using Dune Analytics as the primary data source per project requirements
 * The Graph subgraph provides supplementary protocol metrics
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

      console.log('[TreasuryData] Fetching from Dune Analytics, Safe, and The Graph APIs...');

      // Fetch from Dune (primary), Safe, and The Graph (supplementary) - allow partial failures
      const [duneData, safeData, subgraphData] = await Promise.all([
        getCachedTreasury(() => fetchAllDuneData()).catch(err => {
          console.error('[TreasuryData] Dune fetch failed:', err);
          return null;
        }),
        calculateTotalTreasuryValue().catch(err => {
          console.error('[TreasuryData] Safe data fetch failed:', err);
          return { totalUsd: 0, composition: {}, safes: [] };
        }),
        fetchAllProtocolData('mainnet').catch(err => {
          console.error('[TreasuryData] Subgraph fetch failed (optional):', err);
          return null;
        })
      ]);

      console.log('[TreasuryData] Data fetched successfully');

      // Calculate treasury metrics from subgraph data (supplementary)
      const subgraphMetrics = subgraphData ? calculateTreasuryMetrics(subgraphData) : null;

      // Calculate revenue from Dune data - sum up monthly protocol fees
      let duneRevenue = 0;
      if (duneData?.treasury?.composition) {
        // Dune treasury query returns monthly fee data
        duneRevenue = duneData.treasury.composition.reduce((sum, row) => {
          return sum + parseFloat(row.total_protocol_fee_in_eth || 0);
        }, 0);
      }

      // Check if we have protocol metrics data (Safe treasury might not have USD prices)
      const hasProtocolData = duneRevenue > 0 || (subgraphMetrics?.totalVolume > 0);

      if (!hasProtocolData) {
        console.warn('[TreasuryData] No protocol data available from Dune or The Graph');
        console.warn('[TreasuryData] Dune revenue:', duneRevenue, 'Subgraph volume:', subgraphMetrics?.totalVolume);
        setError('No protocol data available. Please check that VITE_DUNE_API_KEY is set in your .env file and is valid.');
        setData(null);
        setLastUpdated(new Date());
        return;
      }

      // Note: Safe data might be unavailable (USD = 0) because Safe API doesn't provide token prices
      if (safeData?.totalUsd === 0) {
        console.warn('[TreasuryData] Safe treasury value is $0 - Safe API does not provide token pricing data');
      }

      console.log('[TreasuryData] Successfully compiled treasury data:', {
        safeValue: safeData?.totalUsd,
        safeComposition: safeData?.composition,
        duneRevenue: duneRevenue,
        subgraphVolume: subgraphMetrics?.totalVolume,
        subgraphFees: subgraphMetrics?.totalFeesCollected
      });

      // Combine data from all sources - Dune as primary source for protocol metrics
      setData({
        // Treasury holdings from Safe
        totalValue: safeData?.totalUsd || 0,
        composition: safeData?.composition || {},
        safes: safeData?.safes || [],

        // Protocol metrics from Dune (primary source)
        totalFeesCollected: duneData?.revenue?.totalRevenue || subgraphMetrics?.totalFeesCollected || 0,
        totalVolume: subgraphMetrics?.totalVolume || 0, // Subgraph has volume data
        totalTrades: subgraphMetrics?.totalTrades || 0,
        dailyRevenue: subgraphMetrics?.dailyRevenue || [],
        topTokens: subgraphMetrics?.topTokens || [],

        // Dune-specific data
        duneData: duneData,
        revenueByType: duneData?.revenue?.revenueByType || [],

        // Supplementary subgraph data
        subgraphMetrics: subgraphMetrics,

        source: 'Dune + Safe + The Graph'
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
