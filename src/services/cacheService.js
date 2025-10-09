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

export default cacheService;
