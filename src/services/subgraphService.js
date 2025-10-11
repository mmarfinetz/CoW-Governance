import axios from 'axios';

/**
 * CoW Protocol Subgraph Service
 * Source of truth for on-chain data per project requirements
 * 
 * Mainnet Subgraph: https://api.thegraph.com/subgraphs/name/cowprotocol/cow
 * Gnosis Chain: https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc
 * Arbitrum: https://api.thegraph.com/subgraphs/name/cowprotocol/cow-arbitrum-one
 */

const SUBGRAPH_URLS = {
  mainnet: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow',
  gnosis: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-gc',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/cowprotocol/cow-arbitrum-one'
};

/**
 * Execute a GraphQL query against the CoW Protocol subgraph
 */
async function querySubgraph(query, variables = {}, network = 'mainnet') {
  try {
    const url = SUBGRAPH_URLS[network];
    console.log(`[SubgraphService] Querying ${network} subgraph:`, url);

    const response = await axios.post(url, {
      query,
      variables
    });

    if (response.data.errors) {
      console.error('[SubgraphService] GraphQL errors:', response.data.errors);
      throw new Error(`Subgraph query error: ${response.data.errors[0].message}`);
    }

    console.log('[SubgraphService] Query successful');
    return response.data.data;
  } catch (error) {
    console.error(`[SubgraphService] Error querying ${network} subgraph:`, error);
    throw error;
  }
}

/**
 * Fetch total protocol statistics across all time
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
    const totals = data.totals[0] || {};
    
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
    console.error('Error fetching totals from subgraph:', error);
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
    console.error('Error fetching daily stats from subgraph:', error);
    throw error;
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
    console.error('Error fetching tokens from subgraph:', error);
    throw error;
  }
}

/**
 * Fetch recent settlements (for protocol activity)
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
    console.error('Error fetching settlements from subgraph:', error);
    throw error;
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
    console.error('Error fetching solvers from subgraph:', error);
    throw error;
  }
}

/**
 * Fetch all protocol data (comprehensive view)
 */
export async function fetchAllProtocolData(network = 'mainnet') {
  try {
    console.log('[SubgraphService] Fetching comprehensive protocol data...');
    
    const [totals, dailyStats, tokens, settlements, solvers] = await Promise.all([
      fetchTotals(network).catch(err => {
        console.warn('Failed to fetch totals:', err.message);
        return null;
      }),
      fetchDailyStats(30, network).catch(err => {
        console.warn('Failed to fetch daily stats:', err.message);
        return [];
      }),
      fetchTokens(20, network).catch(err => {
        console.warn('Failed to fetch tokens:', err.message);
        return [];
      }),
      fetchRecentSettlements(10, network).catch(err => {
        console.warn('Failed to fetch settlements:', err.message);
        return [];
      }),
      fetchSolvers(20, network).catch(err => {
        console.warn('Failed to fetch solvers:', err.message);
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
    console.error('Error fetching all protocol data:', error);
    throw error;
  }
}

/**
 * Calculate treasury metrics from protocol data
 * (This estimates treasury value from fees collected)
 */
export function calculateTreasuryMetrics(protocolData) {
  if (!protocolData || !protocolData.totals) {
    return {
      totalFeesCollected: 0,
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

