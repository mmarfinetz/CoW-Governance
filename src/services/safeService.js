import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.safe.baseUrl;
const SAFE_ADDRESSES = API_CONFIG.safe.addresses;

/**
 * Fetch Safe wallet information
 */
export async function fetchSafeInfo(safeAddress) {
  try {
    const url = `${BASE_URL}/api/v1/safes/${safeAddress}/`;
    console.log('[SafeService] Fetching Safe info from:', url, new Date().toISOString());
    const response = await axios.get(url);
    return {
      address: response.data.address,
      nonce: response.data.nonce,
      threshold: response.data.threshold,
      owners: response.data.owners,
      masterCopy: response.data.masterCopy,
      modules: response.data.modules,
      fallbackHandler: response.data.fallbackHandler,
      guard: response.data.guard,
      version: response.data.version
    };
  } catch (error) {
    console.error(`Error fetching Safe info for ${safeAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch all balances for a Safe wallet
 */
export async function fetchSafeBalances(safeAddress) {
  try {
    const url = `${BASE_URL}/api/v1/safes/${safeAddress}/balances/`;
    console.log('[SafeService] Fetching balances from:', url, new Date().toISOString());
    const response = await axios.get(url);
    return response.data.map(balance => ({
      tokenAddress: balance.tokenAddress,
      token: balance.token,
      balance: balance.balance,
      ethValue: balance.ethValue,
      timestamp: balance.timestamp,
      fiatBalance: balance.fiatBalance,
      fiatConversion: balance.fiatConversion,
      fiatCode: balance.fiatCode
    }));
  } catch (error) {
    console.error(`Error fetching Safe balances for ${safeAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch Safe USD balances
 */
export async function fetchSafeUsdBalances(safeAddress) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/safes/${safeAddress}/balances/usd/`
    );
    return {
      totalUsd: response.data.totalUsd,
      balances: response.data.items
    };
  } catch (error) {
    console.error(`Error fetching Safe USD balances for ${safeAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch all transactions for a Safe
 */
export async function fetchSafeTransactions(safeAddress, limit = 100) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/safes/${safeAddress}/all-transactions/`,
      {
        params: {
          limit,
          executed: true,
          queued: false,
          trusted: true
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching Safe transactions for ${safeAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch multisig transactions for a Safe
 */
export async function fetchMultisigTransactions(safeAddress, limit = 100) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/v1/safes/${safeAddress}/multisig-transactions/`,
      {
        params: {
          limit,
          executed: true
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching multisig transactions for ${safeAddress}:`, error);
    throw error;
  }
}

/**
 * Fetch comprehensive data for all CoW DAO Safes
 */
export async function fetchAllCoWDAOSafes() {
  const safes = [];

  for (const [name, address] of Object.entries(SAFE_ADDRESSES)) {
    try {
      const info = await fetchSafeInfo(address);
      const balances = await fetchSafeBalances(address);

      safes.push({
        name,
        address,
        ...info,
        balances
      });
    } catch (error) {
      console.error(`Failed to fetch data for ${name} (${address}):`, error);
      safes.push({
        name,
        address,
        error: error.message
      });
    }
  }

  return safes;
}

/**
 * Calculate total treasury value across all Safes
 * NOTE: Safe API does not provide USD pricing, so totalUsd will be 0
 * This function returns token balances but cannot calculate USD values
 */
export async function calculateTotalTreasuryValue() {
  const safes = [];
  let totalUsd = 0; // Will be 0 because Safe API doesn't provide pricing

  const composition = {
    stables: 0,
    eth: 0,
    cow: 0,
    other: 0
  };

  // Fetch token balances for each Safe address
  for (const [name, address] of Object.entries(SAFE_ADDRESSES)) {
    try {
      console.log(`[SafeService] Fetching balances for ${name} (${address})`);
      const info = await fetchSafeInfo(address).catch(() => null);
      const balances = await fetchSafeBalances(address);

      safes.push({
        name,
        address,
        info,
        balances,
        totalUsd: 0 // Safe API doesn't provide USD values
      });

      console.log(`[SafeService] ${name}: ${balances.length} tokens (USD pricing not available from Safe API)`);
    } catch (error) {
      console.error(`Failed to fetch balances for ${name} (${address}):`, error.message);
      safes.push({
        name,
        address,
        error: error.message,
        totalUsd: 0,
        balances: []
      });
    }
  }

  console.log(`[SafeService] Fetched ${safes.length} Safe(s). Note: USD values not available from Safe API.`);

  return {
    totalUsd, // Will be 0 - Safe API limitation
    composition, // Will be empty - Safe API limitation
    safes
  };
}

/**
 * Fetch solver payouts Safe specifically
 */
export async function fetchSolverPayoutsSafe() {
  const address = SAFE_ADDRESSES.solverPayouts;
  try {
    const info = await fetchSafeInfo(address);
    const balances = await fetchSafeBalances(address);
    const transactions = await fetchSafeTransactions(address, 50);

    return {
      address,
      info,
      balances,
      recentTransactions: transactions
    };
  } catch (error) {
    console.error('Error fetching Solver Payouts Safe:', error);
    throw error;
  }
}
