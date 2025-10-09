export const API_CONFIG = {
  snapshot: {
    endpoint: import.meta.env.VITE_SNAPSHOT_API || 'https://hub.snapshot.org/graphql',
    space: 'cow.eth',
    rateLimit: 60 // requests per minute
  },
  dune: {
    baseUrl: 'https://api.dune.com/api/v1',
    apiKey: import.meta.env.VITE_DUNE_API_KEY,
    queries: {
      // Confirmed working query IDs from CoW Protocol's dune-queries repo
      treasury: '3700123',    // Monthly DAO revenue (includes treasury data)
      revenue: '3700123',      // Monthly DAO revenue aggregation
      solverRewards: '5270914', // Solver auction data & rewards
      solverInfo: '5533118'    // Solver conversion prices & metrics
    }
  },
  coinGecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKey: import.meta.env.VITE_COINGECKO_API_KEY,
    tokenId: 'cow-protocol'
  },
  etherscan: {
    baseUrl: 'https://api.etherscan.io/api',
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY,
    cowTokenAddress: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB' // COW token contract
  },
  cowProtocol: {
    baseUrl: import.meta.env.VITE_COW_API_BASE || 'https://api.cow.fi/mainnet'
  },
  safe: {
    baseUrl: import.meta.env.VITE_SAFE_API_BASE || 'https://safe-transaction-mainnet.safe.global',
    addresses: {
      solverPayouts: '0xA03be496e67Ec29bC62F01a428683D7F9c204930',
      // Additional Safe addresses will be fetched from governance proposals
    }
  }
};

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  proposals: 5 * 60 * 1000,      // 5 minutes
  treasury: 60 * 60 * 1000,      // 1 hour
  tokenPrice: 2 * 60 * 1000,     // 2 minutes
  solverMetrics: 15 * 60 * 1000, // 15 minutes
  safeBalances: 10 * 60 * 1000   // 10 minutes
};
