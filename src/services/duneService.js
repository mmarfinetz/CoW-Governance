import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { duneRateLimiter } from '../utils/rateLimiter';
import { retryWithBackoff, isRateLimitError } from '../utils/retryUtils';

const BASE_URL = API_CONFIG.dune.baseUrl;
const API_KEY = API_CONFIG.dune.apiKey;
const QUERIES = API_CONFIG.dune.queries;

// Helper to add auth header
const getHeaders = () => ({
  'X-Dune-API-Key': API_KEY
});

/**
 * Execute a Dune query with rate limiting and retry logic
 */
export async function executeQuery(queryId, parameters = {}) {
  try {
    const url = `${BASE_URL}/query/${queryId}/execute`;
    console.log('[DuneService] Executing query at:', url, `(queryId: ${queryId})`, new Date().toISOString());

    // Use rate limiter before making the request
    return await duneRateLimiter.execute(async () => {
      return await retryWithBackoff(async () => {
        const response = await axios.post(
          url,
          { query_parameters: parameters },
          { headers: getHeaders() }
        );
        return response.data.execution_id;
      }, 3, 2000, 15000); // Retry rate-limited calls with longer backoff
    });
  } catch (error) {
    console.error(`Error executing Dune query ${queryId}:`, error);
    throw error;
  }
}

/**
 * Get query execution status with rate limiting and retry logic
 */
export async function getExecutionStatus(executionId) {
  try {
    return await duneRateLimiter.execute(async () => {
      return await retryWithBackoff(async () => {
        const response = await axios.get(
          `${BASE_URL}/execution/${executionId}/status`,
          { headers: getHeaders() }
        );
        return response.data;
      }, 3, 2000, 15000);
    });
  } catch (error) {
    console.error(`Error getting execution status for ${executionId}:`, error);
    throw error;
  }
}

/**
 * Get query results with rate limiting and retry logic
 */
export async function getQueryResults(queryId) {
  try {
    const url = `${BASE_URL}/query/${queryId}/results`;
    console.log('[DuneService] Fetching results from:', url, `(queryId: ${queryId})`, new Date().toISOString());

    return await duneRateLimiter.execute(async () => {
      return await retryWithBackoff(async () => {
        const response = await axios.get(
          url,
          { headers: getHeaders() }
        );

        const rows = response.data.result?.rows;
        if (!rows) {
          console.error('[DuneService] No rows in response:', response.data);
          throw new Error(`Query ${queryId} returned no data. Response: ${JSON.stringify(response.data)}`);
        }
        console.log('[DuneService] Received', rows.length, 'rows at', new Date().toISOString());
        return rows;
      }, 1, 1000, 2000); // Reduced retries: 1 attempt, shorter backoff for faster failures
    });
  } catch (error) {
    // Enhanced error messages
    if (error.response?.status === 404) {
      console.error(`[DuneService] Query ${queryId} not found or not accessible with your API key`);
      throw new Error(`Dune query ${queryId} not found. This query may be private or deleted. See console for details.`);
    } else if (error.response?.status === 401) {
      console.error('[DuneService] Invalid or expired Dune API key');
      throw new Error('Invalid Dune API key. Please check your .env file and ensure the key is correct.');
    } else if (error.response?.status === 403) {
      console.error(`[DuneService] Access forbidden to query ${queryId}. This query may be private.`);
      throw new Error(`Query ${queryId} is private or you don't have permission to access it.`);
    }
    
    console.error(`[DuneService] Error getting results for query ${queryId}:`, error.response?.data || error.message);
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
    // Handle datapoint limit errors gracefully
    if (error.message && error.message.includes('datapoint limit')) {
      console.warn('⚠️ Dune datapoint limit reached for solver rewards query. Skipping this data.');
      return { totalRewards: 0, solvers: [], timestamp: new Date() };
    }
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
    // Handle query not found or datapoint limit errors
    if (error.message && (error.message.includes('not found') || error.message.includes('datapoint limit'))) {
      console.warn('⚠️ Dune solver info query unavailable (not found or datapoint limit). Skipping this data.');
      return { activeSolvers: 0, solverMetrics: [], timestamp: new Date() };
    }
    console.error('Error fetching solver info from Dune:', error);
    throw error;
  }
}

/**
 * Fetch all Dune data sequentially to respect rate limits
 */
export async function fetchAllDuneData() {
  try {
    console.log('[DuneService] Starting sequential fetch of all Dune data...');

    // Execute queries sequentially to avoid rate limiting
    const treasury = await fetchTreasuryData().catch(err => {
      console.error('Failed to fetch treasury:', err);
      return { totalValue: 0, composition: [], timestamp: new Date() };
    });

    // Add a small delay between requests to be extra safe
    await new Promise(resolve => setTimeout(resolve, 1000));

    const revenue = await fetchRevenueData().catch(err => {
      console.error('Failed to fetch revenue:', err);
      return { totalRevenue: 0, revenueByType: [], timestamp: new Date() };
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const solverRewards = await fetchSolverRewardsData().catch(err => {
      console.warn('Solver rewards data unavailable (likely datapoint limit or query issue). Dashboard will work without it.');
      return { totalRewards: 0, solvers: [], timestamp: new Date() };
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const solverInfo = await fetchSolverInfoData().catch(err => {
      console.warn('Solver info data unavailable (likely query not found or datapoint limit). Dashboard will work without it.');
      return { activeSolvers: 0, solverMetrics: [], timestamp: new Date() };
    });

    console.log('[DuneService] Completed fetching all Dune data');

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
