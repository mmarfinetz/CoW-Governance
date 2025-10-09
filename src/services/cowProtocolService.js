import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.cowProtocol.baseUrl;

/**
 * Fetch API version and health status
 */
export async function fetchApiHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/version`);
    return {
      version: response.data.version,
      name: response.data.name,
      healthy: true
    };
  } catch (error) {
    console.error('Error fetching CoW Protocol API health:', error);
    return {
      healthy: false,
      error: error.message
    };
  }
}

/**
 * Fetch total surplus (trading efficiency metric)
 */
export async function fetchTotalSurplus() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/total_surplus`);
    return {
      totalSurplus: response.data.total_surplus,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching total surplus:', error);
    throw error;
  }
}

/**
 * Fetch solver competition data
 */
export async function fetchSolverCompetition() {
  try {
    // Note: This endpoint may require specific solver auction IDs
    // The actual endpoint structure may vary
    const response = await axios.get(`${BASE_URL}/api/v1/solver_competition`);
    return response.data;
  } catch (error) {
    console.error('Error fetching solver competition:', error);
    // Return empty structure if endpoint doesn't exist
    return {
      solvers: [],
      timestamp: new Date()
    };
  }
}

/**
 * Fetch order statistics
 */
export async function fetchOrderStats() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/orders/stats`);
    return {
      totalOrders: response.data.total_orders,
      filledOrders: response.data.filled_orders,
      cancelledOrders: response.data.cancelled_orders,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
}

/**
 * Fetch auction data for a specific auction ID
 */
export async function fetchAuction(auctionId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/auction/${auctionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching auction ${auctionId}:`, error);
    throw error;
  }
}

/**
 * Fetch fee policies
 */
export async function fetchFeePolicies() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/fee_policies`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fee policies:', error);
    throw error;
  }
}

/**
 * Fetch protocol metrics
 */
export async function fetchProtocolMetrics() {
  try {
    const [health, surplus] = await Promise.all([
      fetchApiHealth().catch(() => ({ healthy: false })),
      fetchTotalSurplus().catch(() => ({ totalSurplus: 0 }))
    ]);

    return {
      health,
      surplus: surplus.totalSurplus || 0,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching protocol metrics:', error);
    throw error;
  }
}
