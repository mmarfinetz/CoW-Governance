import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * CoW Protocol Subgraph Service
 * Using The Graph's Decentralized Network (NOT the deprecated hosted service)
 * 
 * REQUIRES: VITE_GRAPH_API_KEY in .env file
 * Get your free API key at: https://thegraph.com/studio/apikeys/
 * Free tier: 100,000 queries/month
 * 
 * Subgraph IDs from CoW Protocol GitHub repo:
 * - Mainnet: 8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD
 * - Gnosis Chain: (check Graph Explorer)
 * - Arbitrum One: (check Graph Explorer)
 * 
 * References:
 * - GitHub: https://github.com/cowprotocol/subgraph
 * - Graph Explorer: https://thegraph.com/explorer/
 * - Grant: https://forum.cow.fi/t/grant-application-retroactive-redeploy-cow-subgraph/2627
 */

const GRAPH_API_KEY = API_CONFIG.theGraph?.apiKey;
const GRAPH_GATEWAY = API_CONFIG.theGraph?.gateway || 'https://gateway-arbitrum.network.thegraph.com';
const SUBGRAPH_ID = API_CONFIG.theGraph?.subgraphs?.cowMainnet || '8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD';

/**
 * Get the subgraph URL with API key
 */
function getSubgraphUrl() {
  if (!GRAPH_API_KEY) {
    console.warn('[SubgraphService] No Graph API key found. Set VITE_GRAPH_API_KEY in .env');
    return null;
  }
  return `${GRAPH_GATEWAY}/api/${GRAPH_API_KEY}/subgraphs/id/${SUBGRAPH_ID}`;
}

/**
 * Execute a GraphQL query against the CoW Protocol subgraph
 */
async function querySubgraph(query, variables = {}, network = 'mainnet') {
  try {
    const url = getSubgraphUrl();
    if (!url) {
      throw new Error('Graph API key not configured. Add VITE_GRAPH_API_KEY to your .env file. Get a free key at https://thegraph.com/studio/apikeys/');
    }

    console.log(`[SubgraphService] Querying ${network} subgraph via The Graph decentralized network`);
    console.log(`[SubgraphService] URL: ${url.substring(0, 80)}...`); // Show partial URL

    const response = await axios.post(url, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('[SubgraphService] Response status:', response.status);
    console.log('[SubgraphService] Response data:', response.data);

    if (response.data.errors) {
      console.error('[SubgraphService] GraphQL errors:', JSON.stringify(response.data.errors, null, 2));
      throw new Error(`Subgraph query error: ${response.data.errors[0].message}`);
    }

    if (!response.data.data) {
      console.error('[SubgraphService] No data in response:', response.data);
      throw new Error('Subgraph returned no data');
    }

    console.log('[SubgraphService] Query successful');
    return response.data.data;
  } catch (error) {
    console.error(`[SubgraphService] Error querying ${network} subgraph:`, error.message);
    console.error(`[SubgraphService] Full error:`, error.response?.data || error);
    throw error;
  }
}

/**
 * Fetch total protocol statistics
 */
export async function fetchTotals(network = 'mainnet') {
  const query = `
    query Totals {
      totals(first: 1) {
        id
        orders
        traders
        settlements
        volumeUsd
        volumeEth
        feesUsd
        feesEth
        tokens
      }
    }
  `;

  try {
    const data = await querySubgraph(query, {}, network);
    const totals = data.totals?.[0] || {};
    
    console.log('[SubgraphService] Total volume (USD):', totals.volumeUsd);
    console.log('[SubgraphService] Total fees (USD):', totals.feesUsd);
    
    return {
      orders: parseInt(totals.orders) || 0,
      traders: parseInt(totals.traders) || 0,
      settlements: parseInt(totals.settlements) || 0,
      volumeUsd: parseFloat(totals.volumeUsd) || 0,
      volumeEth: parseFloat(totals.volumeEth) || 0,
      feesUsd: parseFloat(totals.feesUsd) || 0,
      feesEth: parseFloat(totals.feesEth) || 0,
      tokens: parseInt(totals.tokens) || 0
    };
  } catch (error) {
    console.error('[SubgraphService] Error fetching totals:', error.message);
    throw error;
  }
}

/**
 * Fetch daily statistics for the last N days
 */
export async function fetchDailyStats(days = 30, network = 'mainnet') {
  const query = `
    query DailyStats($first: Int!) {
      dailyTotals(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        volumeUsd
        volumeEth
        feesUsd
        feesEth
        orders
        settlements
        traders
      }
    }
  `;

  try {
    const data = await querySubgraph(query, { first: days }, network);
    const dailyStats = data.dailyTotals || [];
    
    console.log('[SubgraphService] Fetched', dailyStats.length, 'days of statistics');
    
    return dailyStats.map(day => ({
      timestamp: parseInt(day.timestamp),
      date: new Date(parseInt(day.timestamp) * 1000),
      volumeUsd: parseFloat(day.volumeUsd) || 0,
      volumeEth: parseFloat(day.volumeEth) || 0,
      feesUsd: parseFloat(day.feesUsd) || 0,
      feesEth: parseFloat(day.feesEth) || 0,
      orders: parseInt(day.orders) || 0,
      settlements: parseInt(day.settlements) || 0,
      traders: parseInt(day.traders) || 0
    }));
  } catch (error) {
    console.error('[SubgraphService] Error fetching daily stats:', error.message);
    return [];
  }
}

/**
 * Fetch token information (top traded tokens)
 */
export async function fetchTokens(limit = 20, network = 'mainnet') {
  const query = `
    query Tokens($first: Int!) {
      tokens(first: $first, orderBy: totalVolume, orderDirection: desc) {
        id
        address
        name
        symbol
        decimals
        totalVolume
        numberOfTrades
        priceEth
        priceUsd
      }
    }
  `;

  try {
    const data = await querySubgraph(query, { first: limit }, network);
    const tokens = data.tokens || [];
    
    console.log('[SubgraphService] Fetched', tokens.length, 'tokens');
    
    return tokens.map(token => ({
      id: token.id,
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      decimals: parseInt(token.decimals) || 18,
      totalVolume: parseFloat(token.totalVolume) || 0,
      numberOfTrades: parseInt(token.numberOfTrades) || 0,
      priceEth: parseFloat(token.priceEth) || 0,
      priceUsd: parseFloat(token.priceUsd) || 0
    }));
  } catch (error) {
    console.error('[SubgraphService] Error fetching tokens:', error.message);
    return [];
  }
}

/**
 * Fetch recent settlements
 */
export async function fetchRecentSettlements(limit = 10, network = 'mainnet') {
  const query = `
    query RecentSettlements($first: Int!) {
      settlements(first: $first, orderBy: timestamp, orderDirection: desc) {
        id
        txHash
        timestamp
        solver {
          id
          address
        }
        trades
        volumeUsd
        feeAmountUsd
      }
    }
  `;

  try {
    const data = await querySubgraph(query, { first: limit }, network);
    const settlements = data.settlements || [];
    
    console.log('[SubgraphService] Fetched', settlements.length, 'settlements');
    
    return settlements.map(settlement => ({
      id: settlement.id,
      txHash: settlement.txHash,
      timestamp: parseInt(settlement.timestamp),
      date: new Date(parseInt(settlement.timestamp) * 1000),
      solver: settlement.solver?.address || 'Unknown',
      trades: parseInt(settlement.trades) || 0,
      volumeUsd: parseFloat(settlement.volumeUsd) || 0,
      feeAmountUsd: parseFloat(settlement.feeAmountUsd) || 0
    }));
  } catch (error) {
    console.error('[SubgraphService] Error fetching settlements:', error.message);
    return [];
  }
}

/**
 * Fetch solver statistics
 */
export async function fetchSolvers(limit = 20, network = 'mainnet') {
  const query = `
    query Solvers($first: Int!) {
      users(first: $first, where: { isSolver: true }, orderBy: solvedAmountUsd, orderDirection: desc) {
        id
        address
        isSolver
        solvedAmountUsd
        solvedAmountEth
        numberOfTrades
      }
    }
  `;

  try {
    const data = await querySubgraph(query, { first: limit }, network);
    const solvers = data.users || [];
    
    console.log('[SubgraphService] Fetched', solvers.length, 'solvers');
    
    return solvers.map(solver => ({
      id: solver.id,
      address: solver.address,
      solvedAmountUsd: parseFloat(solver.solvedAmountUsd) || 0,
      solvedAmountEth: parseFloat(solver.solvedAmountEth) || 0,
      numberOfTrades: parseInt(solver.numberOfTrades) || 0
    }));
  } catch (error) {
    console.error('[SubgraphService] Error fetching solvers:', error.message);
    return [];
  }
}

/**
 * Fetch all protocol data (comprehensive view)
 */
export async function fetchAllProtocolData(network = 'mainnet') {
  try {
    console.log('[SubgraphService] Fetching comprehensive protocol data from decentralized network...');
    
    const [totals, dailyStats, tokens, settlements, solvers] = await Promise.all([
      fetchTotals(network).catch(err => {
        console.warn('[SubgraphService] Failed to fetch totals:', err.message);
        return null;
      }),
      fetchDailyStats(30, network).catch(err => {
        console.warn('[SubgraphService] Failed to fetch daily stats:', err.message);
        return [];
      }),
      fetchTokens(20, network).catch(err => {
        console.warn('[SubgraphService] Failed to fetch tokens:', err.message);
        return [];
      }),
      fetchRecentSettlements(10, network).catch(err => {
        console.warn('[SubgraphService] Failed to fetch settlements:', err.message);
        return [];
      }),
      fetchSolvers(20, network).catch(err => {
        console.warn('[SubgraphService] Failed to fetch solvers:', err.message);
        return [];
      })
    ]);

    console.log('[SubgraphService] Comprehensive data fetch complete');

    return {
      totals,
      dailyStats,
      tokens,
      settlements,
      solvers,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[SubgraphService] Error fetching all protocol data:', error.message);
    throw error;
  }
}

/**
 * Calculate treasury metrics from protocol data
 */
export function calculateTreasuryMetrics(protocolData) {
  if (!protocolData || !protocolData.totals) {
    return {
      totalFeesCollected: 0,
      totalVolume: 0,
      totalTrades: 0,
      totalTraders: 0,
      dailyRevenue: [],
      topTokens: []
    };
  }

  const { totals, dailyStats, tokens } = protocolData;

  // Calculate daily revenue from fees
  const dailyRevenue = (dailyStats || []).map(day => ({
    date: day.date,
    revenue: day.feesUsd,
    volume: day.volumeUsd,
    trades: day.orders
  }));

  // Get top tokens by volume
  const topTokens = (tokens || []).slice(0, 10).map(token => ({
    symbol: token.symbol,
    name: token.name,
    volume: token.totalVolume,
    trades: token.numberOfTrades
  }));

  return {
    totalFeesCollected: totals?.feesUsd || 0,
    totalVolume: totals?.volumeUsd || 0,
    totalTrades: totals?.orders || 0,
    totalTraders: totals?.traders || 0,
    dailyRevenue,
    topTokens
  };
}

