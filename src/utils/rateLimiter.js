/**
 * Simple rate limiter to prevent API quota exhaustion
 */
class RateLimiter {
  constructor(maxRequests, timeWindowMs) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
    this.requests = [];
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindowMs);

    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.requests.push(Date.now());
  }

  /**
   * Wait until we can make a request
   */
  async waitForSlot() {
    while (!this.canMakeRequest()) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindowMs - (Date.now() - oldestRequest);

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 1000)));
      }
    }

    this.recordRequest();
  }

  /**
   * Execute a function with rate limiting
   */
  async execute(fn) {
    await this.waitForSlot();
    return await fn();
  }
}

// Dune API rate limiter - 10 requests per minute
export const duneRateLimiter = new RateLimiter(10, 60000);

// Snapshot API rate limiter - 60 requests per minute
export const snapshotRateLimiter = new RateLimiter(60, 60000);

// CoinGecko API rate limiter - 50 requests per minute
export const coinGeckoRateLimiter = new RateLimiter(50, 60000);

// Safe API rate limiter - 60 requests per minute
export const safeRateLimiter = new RateLimiter(60, 60000);

// Etherscan API rate limiter - no explicit limit, but be conservative
export const etherscanRateLimiter = new RateLimiter(5, 1000); // 5 requests per second

export default RateLimiter;
