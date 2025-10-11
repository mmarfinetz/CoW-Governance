import axios from 'axios';

/**
 * CoW Protocol Data Service
 * Fetches protocol statistics from CoW Protocol's REST API
 * 
 * This replaces the subgraph service since The Graph's hosted service is deprecated.
 * CoW Protocol API has proper CORS support and provides aggregated statistics.
 * 
 * API Docs: https://api.cow.fi/docs/
 */

const COW_API_BASE = {
  mainnet: 'https://api.cow.fi/mainnet',
  gnosis: 'https://api.cow.fi/xdai',
  arbitrum: 'https://api.cow.fi/arbitrum_one'
};

/**
 * Fetch total trade volume and statistics
 * Note: CoW Protocol API provides aggregated stats through /api/v1/totals endpoint
 */
export async function fetchTotals(network = 'mainnet') {
  try {
    const baseUrl = COW_API_BASE[network];
    console.log(`[CowProtocolService] Fetching totals from ${network}...`);

    // CoW Protocol doesn't have a direct totals endpoint
    // We'll aggregate from solver competition and other endpoints
    const solverCompetition = await axios.get(`${baseUrl}/api/v1/solver_competition`).catch(() => null);
    
    // Calculate approximate metrics from available data
    let totalVolume = 0;
    let totalFees = 0;
    let totalTrades = 0;

    if (solverCompetition?.data) {
      // Solver competition provides recent activity
      totalVolume = Object.values(solverCompetition.data).reduce((sum, solver) => {
        return sum + (solver.volume || 0);
      }, 0);
    }

    console.log('[CowProtocolService] Fetched approxim totals');
    
    return {
      orders: totalTrades,
      traders: 0, // Not available from REST API
      settlements: 0,
      volumeUsd: totalVolume,
      volumeEth: 0,
      feesUsd: totalFees,
      feesEth: 0,
      tokens: 0
    };
  } catch (error) {
    console.error('[CowProtocolService] Error fetching totals:', error.message);
    // Return zeros instead of throwing to allow partial data loading
    return {
      orders: 0,
      traders: 0,
      settlements: 0,
      volumeUsd: 0,
      volumeEth: 0,
      feesUsd: 0,
      feesEth: 0,
      tokens: 0
    };
  }
}

/**
 * Fetch solver competition data (provides recent volume data)
 */
export async function fetchSolverCompetition(network = 'mainnet') {
  try {
    const baseUrl = COW_API_BASE[network];
    const url = `${baseUrl}/api/v1/solver_competition`;
    console.log(`[CowProtocolService] Fetching solver competition:`, url);

    const response = await axios.get(url);
    const solvers = response.data || {};

    console.log('[CowProtocolService] Fetched solver competition data');
    
    // Convert to array format
    return Object.entries(solvers).map(([address, data]) => ({
      address,
      solvedAmountUsd: data.volume || 0,
      numberOfTrades: data.orders || 0,
      settlements: data.settlements || 0
    }));
  } catch (error) {
    console.error('[CowProtocolService] Error fetching solver competition:', error.message);
    return [];
  }
}

/**
 * Fetch all available protocol data
 */
export async function fetchAllProtocolData(network = 'mainnet') {
  try {
    console.log('[CowProtocolService] Fetching comprehensive protocol data...');
    
    const [totals, solvers] = await Promise.all([
      fetchTotals(network),
      fetchSolverCompetition(network)
    ]);

    console.log('[CowProtocolService] Comprehensive data fetch complete');

    return {
      totals,
      dailyStats: [], // Not available from REST API
      tokens: [], // Not available from REST API
      settlements: [], // Not available from REST API
      solvers,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('[CowProtocolService] Error fetching all protocol data:', error);
    throw error;
  }
}

/**
 * Calculate treasury metrics from protocol data
 * Note: Limited data available from REST API compared to subgraph
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

  const { totals, solvers } = protocolData;

  // Calculate metrics from solvers (recent data)
  const recentVolume = solvers.reduce((sum, solver) => sum + solver.solvedAmountUsd, 0);
  const recentTrades = solvers.reduce((sum, solver) => sum + solver.numberOfTrades, 0);

  return {
    totalFeesCollected: totals.feesUsd || 0,
    totalVolume: Math.max(totals.volumeUsd, recentVolume),
    totalTrades: Math.max(totals.orders, recentTrades),
    totalTraders: totals.traders || 0,
    dailyRevenue: [], // Not available without historical data
    topTokens: [], // Not available from REST API
    recentSolvers: solvers.slice(0, 10)
  };
}

/**
 * Mock implementations for compatibility (until we find alternative data sources)
 */
export async function fetchDailyStats(days = 30, network = 'mainnet') {
  console.warn('[CowProtocolService] Daily stats not available from REST API');
  return [];
}

export async function fetchTokens(limit = 20, network = 'mainnet') {
  console.warn('[CowProtocolService] Token data not available from REST API');
  return [];
}

export async function fetchRecentSettlements(limit = 10, network = 'mainnet') {
  console.warn('[CowProtocolService] Settlement data not available from REST API');
  return [];
}

export async function fetchSolvers(limit = 20, network = 'mainnet') {
  return fetchSolverCompetition(network);
}

