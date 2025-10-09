import { CACHE_DURATIONS } from '../config/apiConfig';

/**
 * Simple in-memory cache with expiration
 */
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in the cache with expiration
   */
  set(key, value, duration) {
    const expiration = Date.now() + duration;
    this.cache.set(key, {
      value,
      expiration
    });
  }

  /**
   * Get a value from the cache
   * Returns null if not found or expired
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key) {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expiration) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear a specific key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get or set pattern: fetch from cache or execute function and cache result
   */
  async getOrSet(key, fetchFunction, duration) {
    const cached = this.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fetchFunction();
    this.set(key, result, duration);
    return result;
  }

  /**
   * Get cache status for all keys
   * Returns information about what's cached and how old it is
   */
  getStatus() {
    const status = {};

    // Check standard cache keys
    const standardKeys = [
      'proposals',
      'treasury',
      'tokenPrice',
      'solverMetrics',
      'safeBalances'
    ];

    for (const key of standardKeys) {
      const item = this.cache.get(key);

      if (item && Date.now() <= item.expiration) {
        const age = Date.now() - (item.expiration - CACHE_DURATIONS[key]);
        status[key] = {
          cached: true,
          age,
          expiresIn: item.expiration - Date.now()
        };
      } else {
        status[key] = {
          cached: false,
          age: 0,
          expiresIn: 0
        };
      }
    }

    return status;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const validEntries = [];
    const expiredEntries = [];

    this.cache.forEach((item, key) => {
      if (Date.now() <= item.expiration) {
        validEntries.push(key);
      } else {
        expiredEntries.push(key);
      }
    });

    return {
      total: this.cache.size,
      valid: validEntries.length,
      expired: expiredEntries.length,
      validKeys: validEntries,
      expiredKeys: expiredEntries
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

/**
 * Cached wrapper functions for common data fetching
 */
export async function getCachedProposals(fetchFunction) {
  return cacheService.getOrSet(
    'proposals',
    fetchFunction,
    CACHE_DURATIONS.proposals
  );
}

export async function getCachedTreasury(fetchFunction) {
  return cacheService.getOrSet(
    'treasury',
    fetchFunction,
    CACHE_DURATIONS.treasury
  );
}

export async function getCachedTokenPrice(fetchFunction) {
  return cacheService.getOrSet(
    'tokenPrice',
    fetchFunction,
    CACHE_DURATIONS.tokenPrice
  );
}

export async function getCachedSolverMetrics(fetchFunction) {
  return cacheService.getOrSet(
    'solverMetrics',
    fetchFunction,
    CACHE_DURATIONS.solverMetrics
  );
}

export async function getCachedSafeBalances(fetchFunction) {
  return cacheService.getOrSet(
    'safeBalances',
    fetchFunction,
    CACHE_DURATIONS.safeBalances
  );
}

export async function getCachedDelegation(address, fetchFunction) {
  return cacheService.getOrSet(
    `delegation_${address.toLowerCase()}`,
    fetchFunction,
    CACHE_DURATIONS.delegations
  );
}

export async function getCachedDelegationHistory(address, fetchFunction) {
  return cacheService.getOrSet(
    `delegationHistory_${address.toLowerCase()}`,
    fetchFunction,
    CACHE_DURATIONS.delegations
  );
}

export async function getCachedDelegates(fetchFunction) {
  return cacheService.getOrSet(
    'recognizedDelegates',
    fetchFunction,
    CACHE_DURATIONS.delegates
  );
}

export async function getCachedDelegateVotes(address, fetchFunction) {
  return cacheService.getOrSet(
    `delegateVotes_${address.toLowerCase()}`,
    fetchFunction,
    CACHE_DURATIONS.delegations
  );
}

export async function getCachedChainData(proposalId, fetchFunction) {
  return cacheService.getOrSet(
    `chainData_${proposalId}`,
    fetchFunction,
    CACHE_DURATIONS.chainData
  );
}

export async function getCachedChainDistribution(fetchFunction) {
  return cacheService.getOrSet(
    'chainDistribution',
    fetchFunction,
    CACHE_DURATIONS.chainData
  );
}

/**
 * Export cache status for configuration display
 */
export function getCacheStatus() {
  return cacheService.getStatus();
}

/**
 * Export cache statistics
 */
export function getCacheStats() {
  return cacheService.getStats();
}

export default cacheService;
