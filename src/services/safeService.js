import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.safe.baseUrl;
const SAFE_ADDRESSES = API_CONFIG.safe.addresses;

/**
 * Fetch Safe wallet information
 */
export async function fetchSafeInfo(safeAddress) {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/safes/${safeAddress}/`);
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
    const response = await axios.get(`${BASE_URL}/api/v1/safes/${safeAddress}/balances/`);
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
 */
export async function calculateTotalTreasuryValue() {
  const safes = await fetchAllCoWDAOSafes();

  let totalUsd = 0;
  const composition = {
    stables: 0,
    eth: 0,
    cow: 0,
    other: 0
  };

  for (const safe of safes) {
    if (safe.balances) {
      for (const balance of safe.balances) {
        const usdValue = parseFloat(balance.fiatBalance || 0);
        totalUsd += usdValue;

        // Categorize tokens
        if (balance.token?.symbol?.includes('USD') ||
            balance.token?.symbol?.includes('DAI')) {
          composition.stables += usdValue;
        } else if (balance.token?.symbol === 'ETH' ||
                   balance.token?.symbol === 'WETH') {
          composition.eth += usdValue;
        } else if (balance.token?.symbol === 'COW' ||
                   balance.token?.symbol === 'vCOW') {
          composition.cow += usdValue;
        } else {
          composition.other += usdValue;
        }
      }
    }
  }

  return {
    totalUsd,
    composition,
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
