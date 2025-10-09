import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const BASE_URL = API_CONFIG.etherscan.baseUrl;
const API_KEY = API_CONFIG.etherscan.apiKey;
const COW_TOKEN_ADDRESS = API_CONFIG.etherscan.cowTokenAddress;

/**
 * Get token holder count
 */
export async function fetchTokenHolderCount() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'token',
        action: 'tokenholdercount',
        contractaddress: COW_TOKEN_ADDRESS,
        apikey: API_KEY
      }
    });

    if (response.data.status === '1') {
      return parseInt(response.data.result);
    }
    throw new Error(response.data.message || 'Failed to fetch holder count');
  } catch (error) {
    console.error('Error fetching token holder count from Etherscan:', error);
    throw error;
  }
}

/**
 * Get top token holders
 */
export async function fetchTopTokenHolders(page = 1, offset = 100) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: COW_TOKEN_ADDRESS,
        page: page,
        offset: offset,
        apikey: API_KEY
      }
    });

    if (response.data.status === '1') {
      return response.data.result.map(holder => ({
        address: holder.TokenHolderAddress,
        balance: holder.TokenHolderQuantity,
        percentage: parseFloat(holder.TokenHolderQuantity) / 1e18 // Adjust for decimals
      }));
    }
    throw new Error(response.data.message || 'Failed to fetch top holders');
  } catch (error) {
    console.error('Error fetching top token holders from Etherscan:', error);
    throw error;
  }
}

/**
 * Get ERC20 token supply
 */
export async function fetchTokenSupply() {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'stats',
        action: 'tokensupply',
        contractaddress: COW_TOKEN_ADDRESS,
        apikey: API_KEY
      }
    });

    if (response.data.status === '1') {
      return parseFloat(response.data.result) / 1e18; // Convert from wei
    }
    throw new Error(response.data.message || 'Failed to fetch token supply');
  } catch (error) {
    console.error('Error fetching token supply from Etherscan:', error);
    throw error;
  }
}

/**
 * Get account balance for a specific address
 */
export async function fetchAccountBalance(address) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: COW_TOKEN_ADDRESS,
        address: address,
        tag: 'latest',
        apikey: API_KEY
      }
    });

    if (response.data.status === '1') {
      return parseFloat(response.data.result) / 1e18; // Convert from wei
    }
    throw new Error(response.data.message || 'Failed to fetch account balance');
  } catch (error) {
    console.error('Error fetching account balance from Etherscan:', error);
    throw error;
  }
}

/**
 * Get multiple account balances
 */
export async function fetchMultipleBalances(addresses) {
  try {
    const balances = await Promise.all(
      addresses.map(address => fetchAccountBalance(address))
    );

    return addresses.map((address, index) => ({
      address,
      balance: balances[index]
    }));
  } catch (error) {
    console.error('Error fetching multiple balances from Etherscan:', error);
    throw error;
  }
}

/**
 * Calculate token concentration metrics
 */
export async function calculateConcentrationMetrics() {
  try {
    const topHolders = await fetchTopTokenHolders(1, 50);
    const totalSupply = await fetchTokenSupply();

    if (!topHolders || !totalSupply) {
      throw new Error('Failed to calculate concentration metrics');
    }

    // Calculate top holder percentages
    const top10Total = topHolders
      .slice(0, 10)
      .reduce((sum, holder) => sum + holder.percentage, 0);

    const top50Total = topHolders
      .reduce((sum, holder) => sum + holder.percentage, 0);

    return {
      top10Percentage: (top10Total / totalSupply) * 100,
      top50Percentage: (top50Total / totalSupply) * 100,
      topHolders: topHolders.slice(0, 10), // Return top 10 for display
      totalSupply
    };
  } catch (error) {
    console.error('Error calculating concentration metrics:', error);
    throw error;
  }
}
