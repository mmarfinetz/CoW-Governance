import { useState, useEffect } from 'react';
import { analyzeChainDistribution } from '../services/multiChainService';
import { getCachedChainDistribution } from '../services/cacheService';

/**
 * Hook to fetch and manage multi-chain voting power data
 * Analyzes recent proposals to determine voting power distribution across chains
 */
export function useMultiChainData(proposals) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    if (!proposals || proposals.length === 0) {
      setData({
        mainnet: 0,
        gnosis: 0,
        arbitrum: 0,
        base: 0,
        polygon: 0,
        unknown: 0,
        totalVotingPower: 0,
        proposalsAnalyzed: 0
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useMultiChainData] Analyzing chain distribution for', proposals.length, 'proposals');

      // Use cached chain distribution to avoid re-analyzing on every render
      const chainDistribution = await getCachedChainDistribution(
        () => analyzeChainDistribution(proposals)
      );

      console.log('[useMultiChainData] Chain distribution result:', chainDistribution);

      setData(chainDistribution);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching multi-chain data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [proposals]); // Re-fetch when proposals change

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
