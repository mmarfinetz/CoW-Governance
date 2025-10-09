import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.dune.baseUrl;
const API_KEY = API_CONFIG.dune.apiKey;
const QUERIES = API_CONFIG.dune.queries;

// Helper to add auth header
const getHeaders = () => ({
  'X-Dune-API-Key': API_KEY
});

/**
 * Execute a Dune query
 */
export async function executeQuery(queryId, parameters = {}) {
  try {
    const response = await axios.post(
      `${BASE_URL}/query/${queryId}/execute`,
      { query_parameters: parameters },
      { headers: getHeaders() }
    );

    return response.data.execution_id;
  } catch (error) {
    console.error(`Error executing Dune query ${queryId}:`, error);
    throw error;
  }
}

/**
 * Get query execution status
 */
export async function getExecutionStatus(executionId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/execution/${executionId}/status`,
      { headers: getHeaders() }
    );

    return response.data;
  } catch (error) {
    console.error(`Error getting execution status for ${executionId}:`, error);
    throw error;
  }
}

/**
 * Get query results
 */
export async function getQueryResults(queryId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/query/${queryId}/results`,
      { headers: getHeaders() }
    );

    return response.data.result.rows;
  } catch (error) {
    console.error(`Error getting results for query ${queryId}:`, error);
    throw error;
  }
}

/**
 * Execute query and wait for results
 */
export async function executeAndWait(queryId, parameters = {}, maxWaitTime = 60000) {
  try {
    const executionId = await executeQuery(queryId, parameters);

    // Poll for results
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      const status = await getExecutionStatus(executionId);

      if (status.state === 'QUERY_STATE_COMPLETED') {
        return await getQueryResults(queryId);
      }

      if (status.state === 'QUERY_STATE_FAILED') {
        throw new Error('Query execution failed');
      }

      // Wait 2 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Query execution timeout');
  } catch (error) {
    console.error('Error in executeAndWait:', error);
    throw error;
  }
}

/**
 * Fetch CoW DAO treasury data from Dune
 */
export async function fetchTreasuryData() {
  try {
    // If no API key is set, return fallback data structure
    if (!API_KEY) {
      console.warn('Dune API key not set, using fallback data structure');
      return {
        totalValue: 0,
        composition: [],
        timestamp: new Date()
      };
    }

    const results = await getQueryResults(QUERIES.treasury);
    return {
      totalValue: results[0]?.total_value_usd || 0,
      composition: results,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching treasury data from Dune:', error);
    throw error;
  }
}

/**
 * Fetch CoW Protocol revenue data from Dune
 */
export async function fetchRevenueData() {
  try {
    if (!API_KEY) {
      console.warn('Dune API key not set, using fallback data structure');
      return {
        totalRevenue: 0,
        revenueByType: [],
        timestamp: new Date()
      };
    }

    const results = await getQueryResults(QUERIES.revenue);
    return {
      totalRevenue: results.reduce((sum, row) => sum + (row.revenue_usd || 0), 0),
      revenueByType: results,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching revenue data from Dune:', error);
    throw error;
  }
}

/**
 * Fetch solver rewards data from Dune
 */
export async function fetchSolverRewardsData() {
  try {
    if (!API_KEY) {
      console.warn('Dune API key not set, using fallback data structure');
      return {
        totalRewards: 0,
        solvers: [],
        timestamp: new Date()
      };
    }

    const results = await getQueryResults(QUERIES.solverRewards);
    return {
      totalRewards: results.reduce((sum, row) => sum + (row.rewards || 0), 0),
      solvers: results,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching solver rewards from Dune:', error);
    throw error;
  }
}

/**
 * Fetch solver info and competition metrics from Dune
 */
export async function fetchSolverInfoData() {
  try {
    if (!API_KEY) {
      console.warn('Dune API key not set, using fallback data structure');
      return {
        activeSolvers: 0,
        solverMetrics: [],
        timestamp: new Date()
      };
    }

    const results = await getQueryResults(QUERIES.solverInfo);
    return {
      activeSolvers: results.length,
      solverMetrics: results,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching solver info from Dune:', error);
    throw error;
  }
}

/**
 * Fetch all Dune data in parallel
 */
export async function fetchAllDuneData() {
  try {
    const [treasury, revenue, solverRewards, solverInfo] = await Promise.all([
      fetchTreasuryData().catch(err => {
        console.error('Failed to fetch treasury:', err);
        return { totalValue: 0, composition: [], timestamp: new Date() };
      }),
      fetchRevenueData().catch(err => {
        console.error('Failed to fetch revenue:', err);
        return { totalRevenue: 0, revenueByType: [], timestamp: new Date() };
      }),
      fetchSolverRewardsData().catch(err => {
        console.error('Failed to fetch solver rewards:', err);
        return { totalRewards: 0, solvers: [], timestamp: new Date() };
      }),
      fetchSolverInfoData().catch(err => {
        console.error('Failed to fetch solver info:', err);
        return { activeSolvers: 0, solverMetrics: [], timestamp: new Date() };
      })
    ]);

    return {
      treasury,
      revenue,
      solverRewards,
      solverInfo
    };
  } catch (error) {
    console.error('Error fetching all Dune data:', error);
    throw error;
  }
}
