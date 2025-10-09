import { useState, useEffect } from 'react';
import { fetchTokenData, fetchSimplePrice } from '../services/coinGeckoService';
import { fetchTokenHolderCount } from '../services/etherscanService';
import { getCachedTokenPrice } from '../services/cacheService';

/**
 * Hook to fetch and manage token data from CoinGecko and Etherscan
 */
export function useTokenData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching token data from CoinGecko and Etherscan...');

      // Fetch comprehensive token data and holder count in parallel
      const [tokenData, holderCount] = await Promise.all([
        getCachedTokenPrice(() => fetchTokenData()),
        fetchTokenHolderCount().catch(err => {
          console.warn('Failed to fetch holder count from Etherscan:', err);
          return null; // Holder count is optional
        })
      ]);

      setData({
        ...tokenData,
        holderCount: holderCount || tokenData.holderCount // Use CoinGecko holder count if Etherscan fails
      });

      setLastUpdated(new Date());
      console.log('Token data fetched successfully');
    } catch (err) {
      console.error('Error fetching token data:', err);
      setError(err.message || 'Failed to fetch token data from CoinGecko');
      setData(null); // NO fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up periodic refresh for price data (every 2 minutes)
    const interval = setInterval(() => {
      fetchSimplePrice()
        .then(priceData => {
          setData(prev => ({
            ...prev,
            price: priceData.price,
            marketCap: priceData.marketCap,
            priceChange24h: priceData.priceChange24h
          }));
          setLastUpdated(new Date());
        })
        .catch(err => console.error('Error updating price:', err));
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
