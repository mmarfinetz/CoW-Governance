import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.coinGecko.baseUrl;
const TOKEN_ID = API_CONFIG.coinGecko.tokenId;
const API_KEY = API_CONFIG.coinGecko.apiKey;

// Add API key to headers if available
const getHeaders = () => {
  if (API_KEY) {
    return { 'x-cg-demo-api-key': API_KEY };
  }
  return {};
};

/**
 * Fetch comprehensive token data including price, market cap, and holder count
 */
export async function fetchTokenData() {
  try {
    const response = await axios.get(
      `${BASE_URL}/coins/${TOKEN_ID}`,
      {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: false,
          sparkline: false
        },
        headers: getHeaders()
      }
    );

    const data = response.data;

    return {
      price: data.market_data?.current_price?.usd || 0,
      priceChange24h: data.market_data?.price_change_percentage_24h || 0,
      priceChange7d: data.market_data?.price_change_percentage_7d || 0,
      priceChange30d: data.market_data?.price_change_percentage_30d || 0,
      marketCap: data.market_data?.market_cap?.usd || 0,
      marketCapRank: data.market_data?.market_cap_rank || 0,
      totalVolume: data.market_data?.total_volume?.usd || 0,
      circulatingSupply: data.market_data?.circulating_supply || 0,
      totalSupply: data.market_data?.total_supply || 0,
      maxSupply: data.market_data?.max_supply || 0,
      ath: data.market_data?.ath?.usd || 0,
      athDate: data.market_data?.ath_date?.usd || null,
      atl: data.market_data?.atl?.usd || 0,
      atlDate: data.market_data?.atl_date?.usd || null,
      // Community data
      twitterFollowers: data.community_data?.twitter_followers || 0,
      telegramUsers: data.community_data?.telegram_channel_user_count || 0,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error fetching token data from CoinGecko:', error);
    throw error;
  }
}

/**
 * Fetch simple price data (lighter endpoint for frequent updates)
 */
export async function fetchSimplePrice() {
  try {
    const response = await axios.get(
      `${BASE_URL}/simple/price`,
      {
        params: {
          ids: TOKEN_ID,
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_vol: true,
          include_24hr_change: true,
          include_last_updated_at: true
        },
        headers: getHeaders()
      }
    );

    const data = response.data[TOKEN_ID];

    return {
      price: data.usd || 0,
      marketCap: data.usd_market_cap || 0,
      volume24h: data.usd_24h_vol || 0,
      priceChange24h: data.usd_24h_change || 0,
      lastUpdated: data.last_updated_at ? new Date(data.last_updated_at * 1000) : null
    };
  } catch (error) {
    console.error('Error fetching simple price from CoinGecko:', error);
    throw error;
  }
}

/**
 * Fetch historical market data for charts
 */
export async function fetchMarketChart(days = 30) {
  try {
    const response = await axios.get(
      `${BASE_URL}/coins/${TOKEN_ID}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: days <= 1 ? 'hourly' : 'daily'
        },
        headers: getHeaders()
      }
    );

    return {
      prices: response.data.prices || [],
      marketCaps: response.data.market_caps || [],
      totalVolumes: response.data.total_volumes || []
    };
  } catch (error) {
    console.error('Error fetching market chart from CoinGecko:', error);
    throw error;
  }
}

/**
 * Fetch token holder count (requires Pro tier)
 * Falls back to community data if not available
 */
export async function fetchTokenHolders() {
  try {
    const response = await axios.get(
      `${BASE_URL}/coins/ethereum/contract/0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB`,
      {
        headers: getHeaders()
      }
    );

    // Note: Holder count might require Analyst tier or above
    return {
      holderCount: response.data.detail_platforms?.ethereum?.holders_count || null,
      address: response.data.contract_address
    };
  } catch (error) {
    console.error('Error fetching token holders from CoinGecko:', error);
    // Return null if endpoint is not accessible
    return { holderCount: null, address: null };
  }
}
