import { useState, useEffect } from 'react';
import { fetchAllDuneData } from '../services/duneService';
import { fetchAllProtocolData, calculateTreasuryMetrics } from '../services/subgraphService';
import { calculateTotalTreasuryValue } from '../services/safeService';
import { getCachedTreasury } from '../services/cacheService';

/**
 * Hook to fetch and manage treasury data from CoW Protocol Subgraph (primary), Dune, and Safe
 * NOTE: Using CoW Protocol Subgraph (The Graph) as the primary data source per project requirements
 * Dune provides custom monthly revenue queries (optional)
 * Safe provides treasury holdings
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

      console.log('[TreasuryData] Fetching from Subgraph (The Graph), Dune, and Safe APIs...');

      // Fetch from Subgraph (primary), Dune (optional), and Safe - allow partial failures
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

      // Process monthly revenue from Dune custom query (5938001)
      let duneMonthlyRevenue = [];
      let duneTotalRevenue = 0;
      
      if (duneData?.revenue?.revenueByType && Array.isArray(duneData.revenue.revenueByType)) {
        // Your custom monthly revenue query - adapt to your query's column names
        duneMonthlyRevenue = duneData.revenue.revenueByType.map(row => ({
          month: row.month || row.date || row.time_period || row.period,
          revenue: parseFloat(row.revenue_usd || row.total_revenue || row.fees_usd || row.protocol_fees || 0),
          fees: parseFloat(row.fees || row.protocol_fees || 0),
          volume: parseFloat(row.volume || row.trading_volume || 0)
        }));
        
        duneTotalRevenue = duneMonthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
        console.log('[TreasuryData] Dune monthly revenue:', duneMonthlyRevenue.length, 'months, total: $', duneTotalRevenue.toFixed(2));
      }

      // Check if we have protocol metrics data (Safe treasury might not have USD prices)
      const hasProtocolData = duneTotalRevenue > 0 || (subgraphMetrics?.totalVolume > 0);

      if (!hasProtocolData) {
        console.warn('[TreasuryData] No protocol data available from Dune or The Graph');
        console.warn('[TreasuryData] Dune revenue:', duneTotalRevenue, 'Subgraph volume:', subgraphMetrics?.totalVolume);
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
        duneMonthlyData: duneMonthlyRevenue.length,
        duneTotalRevenue: duneTotalRevenue,
        subgraphVolume: subgraphMetrics?.totalVolume,
        subgraphFees: subgraphMetrics?.totalFeesCollected
      });

      // Combine data from all sources - Dune as primary source for revenue metrics
      setData({
        // Treasury holdings from Safe
        totalValue: safeData?.totalUsd || 0,
        composition: safeData?.composition || {},
        safes: safeData?.safes || [],

        // Protocol metrics - prioritize Dune custom query for fees
        totalFeesCollected: duneTotalRevenue > 0 ? duneTotalRevenue : (subgraphMetrics?.totalFeesCollected || 0),
        totalVolume: subgraphMetrics?.totalVolume || 0, // Subgraph has volume data
        totalTrades: subgraphMetrics?.totalTrades || 0,
        
        // Revenue data - use Dune monthly data if available, fallback to subgraph daily
        monthlyRevenue: duneMonthlyRevenue.length > 0 ? duneMonthlyRevenue : (subgraphMetrics?.dailyRevenue || []),
        dailyRevenue: subgraphMetrics?.dailyRevenue || [],
        topTokens: subgraphMetrics?.topTokens || [],

        // Dune-specific data
        duneData: duneData,
        revenueByType: duneData?.revenue?.revenueByType || [],
        hasCustomDuneQuery: duneMonthlyRevenue.length > 0,

        // Supplementary subgraph data
        subgraphMetrics: subgraphMetrics,

        source: duneMonthlyRevenue.length > 0 ? 'Dune (Custom Query) + Safe + The Graph' : 'Dune + Safe + The Graph'
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
