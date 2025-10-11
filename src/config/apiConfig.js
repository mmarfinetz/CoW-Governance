import govConfig from './govConfig.json';

// Export config version for tracking
export const CONFIG_VERSION = govConfig.version;

// Debug: Log environment variables on load
console.log('[API Config] Loading environment variables...');
console.log('[API Config] VITE_GRAPH_API_KEY exists:', !!import.meta.env.VITE_GRAPH_API_KEY);
console.log('[API Config] VITE_DUNE_API_KEY exists:', !!import.meta.env.VITE_DUNE_API_KEY);
console.log('[API Config] VITE_COINGECKO_API_KEY exists:', !!import.meta.env.VITE_COINGECKO_API_KEY);
console.log('[API Config] VITE_ETHERSCAN_API_KEY exists:', !!import.meta.env.VITE_ETHERSCAN_API_KEY);

// Build API configuration from govConfig with environment variable overrides
export const API_CONFIG = {
  snapshot: {
    endpoint: import.meta.env.VITE_SNAPSHOT_API || govConfig.apis.snapshot.endpoint,
    space: govConfig.governance.space,
    rateLimit: govConfig.apis.snapshot.rateLimit
  },
  dune: {
    baseUrl: govConfig.apis.dune.baseUrl,
    apiKey: import.meta.env.VITE_DUNE_API_KEY,
    queries: {
      // Query IDs from govConfig - confirmed working from CoW Protocol's dune-queries repo
      treasury: govConfig.queries.dune.treasury.id,
      revenue: govConfig.queries.dune.revenue.id,
      solverRewards: govConfig.queries.dune.solverRewards.id,
      solverInfo: govConfig.queries.dune.solverInfo.id
    }
  },
  coinGecko: {
    baseUrl: govConfig.apis.coinGecko.baseUrl,
    apiKey: import.meta.env.VITE_COINGECKO_API_KEY,
    tokenId: govConfig.apis.coinGecko.tokenId
  },
  etherscan: {
    baseUrl: govConfig.apis.etherscan.baseUrl,
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY,
    cowTokenAddress: govConfig.apis.etherscan.cowTokenAddress
  },
  cowProtocol: {
    baseUrl: import.meta.env.VITE_COW_API_BASE || govConfig.apis.cowProtocol.baseUrl
  },
  theGraph: {
    apiKey: import.meta.env.VITE_GRAPH_API_KEY,
    gateway: 'https://gateway-arbitrum.network.thegraph.com',
    subgraphs: {
      cowMainnet: '8mdwJG7YCSwqfxUbhCypZvoubeZcFVpCHb4zmHhvuKTD'
    }
  },
  safe: {
    baseUrl: import.meta.env.VITE_SAFE_API_BASE || govConfig.apis.safe.baseUrl,
    addresses: {
      solverPayouts: govConfig.apis.safe.solverPayoutsAddress,
      // Additional Safe addresses will be fetched from governance proposals
    }
  },
  forum: {
    baseUrl: 'https://forum.cow.fi',
    delegatesPath: '/c/governance/delegates',
    apiBaseUrl: 'https://forum.cow.fi'
  },
  chains: {
    // Supported chains for multi-chain voting aggregation
    mainnet: {
      name: 'Ethereum Mainnet',
      chainId: 1,
      rpcUrl: 'https://eth.llamarpc.com'
    },
    gnosis: {
      name: 'Gnosis Chain',
      chainId: 100,
      rpcUrl: 'https://rpc.gnosischain.com'
    },
    arbitrum: {
      name: 'Arbitrum One',
      chainId: 42161,
      rpcUrl: 'https://arb1.arbitrum.io/rpc'
    },
    base: {
      name: 'Base',
      chainId: 8453,
      rpcUrl: 'https://mainnet.base.org'
    },
    polygon: {
      name: 'Polygon',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com'
    }
  }
};

// Cache durations in milliseconds - sourced from govConfig
export const CACHE_DURATIONS = {
  proposals: govConfig.cache.proposals,
  treasury: govConfig.cache.treasury,
  tokenPrice: govConfig.cache.tokenPrice,
  solverMetrics: govConfig.cache.solverMetrics,
  safeBalances: govConfig.cache.safeBalances,
  delegations: 5 * 60 * 1000,    // 5 minutes
  delegates: 60 * 60 * 1000,     // 1 hour
  chainData: 15 * 60 * 1000      // 15 minutes - multi-chain voting aggregation
};

// Export governance configuration
export const GOVERNANCE_CONFIG = govConfig.governance;
