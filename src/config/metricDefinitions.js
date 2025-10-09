/**
 * Comprehensive metric definitions for CoW DAO Governance Dashboard
 *
 * This file defines the formulas, sources, and calculation methods for all metrics
 * displayed in the dashboard. These definitions are used for:
 * - Transparency: Users can see exactly how metrics are calculated
 * - Reconciliation: Comparing data from multiple sources
 * - Validation: Ensuring consistency across data sources
 */

export const METRIC_DEFINITIONS = {
  // Governance Metrics (Snapshot)
  totalProposals: {
    name: 'Total Proposals',
    formula: 'COUNT(proposals WHERE space = "cow.eth")',
    calculation: 'Total number of proposals created in the CoW DAO space',
    source: 'Snapshot GraphQL API',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'count',
    category: 'governance'
  },

  activeProposals: {
    name: 'Active Proposals',
    formula: 'COUNT(proposals WHERE state = "active")',
    calculation: 'Number of proposals currently open for voting',
    source: 'Snapshot GraphQL API',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'count',
    category: 'governance'
  },

  averageParticipation: {
    name: 'Average Participation',
    formula: 'AVG(scores_total) for closed proposals',
    calculation: 'Average total voting power (in COW tokens) across all closed proposals',
    source: 'Snapshot GraphQL API',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'COW tokens',
    category: 'governance'
  },

  participationRate: {
    name: 'Participation Rate',
    formula: '(averageParticipation / quorum) × 100',
    calculation: 'Percentage of quorum reached by average participation',
    source: 'Calculated from Snapshot data',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'percentage',
    category: 'governance'
  },

  quorum: {
    name: 'Quorum Threshold',
    formula: 'space.voting.quorum',
    calculation: 'Minimum voting power required for proposal to pass',
    source: 'Snapshot Space Configuration',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: 'On-demand (rarely changes)',
    unit: 'COW tokens',
    category: 'governance'
  },

  successRate: {
    name: 'Proposal Success Rate',
    formula: '(passedProposals / closedProposals) × 100',
    calculation: 'Percentage of proposals that met quorum and passed. A proposal passes if: (1) scores_total >= quorum, AND (2) winning choice has more votes than all other choices combined',
    source: 'Calculated from Snapshot data',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'percentage',
    category: 'governance'
  },

  maxVotes: {
    name: 'Maximum Votes Recorded',
    formula: 'MAX(scores_total) across all proposals',
    calculation: 'Highest total voting power ever recorded on a single proposal',
    source: 'Snapshot GraphQL API',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: '5 minutes',
    unit: 'COW tokens',
    category: 'governance'
  },

  votingPeriod: {
    name: 'Voting Period',
    formula: 'space.voting.period',
    calculation: 'Duration (in days) that proposals remain open for voting',
    source: 'Snapshot Space Configuration',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: 'On-demand (rarely changes)',
    unit: 'days',
    category: 'governance'
  },

  votingDelay: {
    name: 'Execution Delay',
    formula: 'space.voting.delay',
    calculation: 'Time delay (in days) between proposal passing and execution',
    source: 'Snapshot Space Configuration',
    endpoint: 'https://hub.snapshot.org/graphql',
    updateFrequency: 'On-demand (rarely changes)',
    unit: 'days',
    category: 'governance'
  },

  healthScore: {
    name: 'Governance Health Score',
    formula: '(participationRate × 0.4) + (hasActiveProposals ? 20 : 0) + MIN(totalProposals × 0.4, 20) + (hasTreasury ? 20 : 0)',
    calculation: 'Composite score (0-100) measuring overall governance health. Weighted factors: Participation (40%), Active proposals (20%), Proposal history (20%), Treasury health (20%)',
    source: 'Calculated from multiple sources',
    endpoint: 'Multiple APIs',
    updateFrequency: '5 minutes',
    unit: 'score (0-100)',
    category: 'governance'
  },

  // Token Metrics
  tokenPrice: {
    name: 'COW Token Price',
    formula: 'market_data.current_price.usd',
    calculation: 'Current market price of COW token in USD',
    source: 'CoinGecko API',
    endpoint: 'https://api.coingecko.com/api/v3/coins/cow-protocol',
    updateFrequency: '2 minutes',
    unit: 'USD',
    category: 'token'
  },

  marketCap: {
    name: 'Market Capitalization',
    formula: 'market_data.market_cap.usd',
    calculation: 'Total market value of all COW tokens in circulation',
    source: 'CoinGecko API',
    endpoint: 'https://api.coingecko.com/api/v3/coins/cow-protocol',
    updateFrequency: '2 minutes',
    unit: 'USD',
    category: 'token'
  },

  volume24h: {
    name: '24h Trading Volume',
    formula: 'market_data.total_volume.usd',
    calculation: 'Total USD value of COW tokens traded in last 24 hours',
    source: 'CoinGecko API',
    endpoint: 'https://api.coingecko.com/api/v3/coins/cow-protocol',
    updateFrequency: '2 minutes',
    unit: 'USD',
    category: 'token'
  },

  circulatingSupply: {
    name: 'Circulating Supply',
    formula: 'market_data.circulating_supply',
    calculation: 'Number of COW tokens currently in circulation (excludes locked/vested tokens)',
    source: 'CoinGecko API',
    endpoint: 'https://api.coingecko.com/api/v3/coins/cow-protocol',
    updateFrequency: '2 minutes',
    unit: 'COW tokens',
    category: 'token'
  },

  totalSupply: {
    name: 'Total Supply',
    formula: 'market_data.total_supply',
    calculation: 'Maximum number of COW tokens that will ever exist',
    source: 'CoinGecko API',
    endpoint: 'https://api.coingecko.com/api/v3/coins/cow-protocol',
    updateFrequency: '2 minutes',
    unit: 'COW tokens',
    category: 'token'
  },

  holderCount: {
    name: 'Token Holders',
    formula: 'COUNT(DISTINCT holder_address) from Etherscan',
    calculation: 'Total number of unique Ethereum addresses holding COW tokens',
    source: 'Etherscan API',
    endpoint: 'https://api.etherscan.io/api',
    updateFrequency: '10 minutes',
    unit: 'addresses',
    category: 'token'
  },

  // Treasury Metrics (Dune Analytics)
  treasuryValue: {
    name: 'Treasury Total Value',
    formula: 'SUM(token_balance × token_price_usd) from Dune',
    calculation: 'Total USD value of all assets in CoW DAO treasury',
    source: 'Dune Analytics Query #3700123',
    endpoint: 'https://api.dune.com/api/v1/query/3700123/results',
    updateFrequency: '1 hour',
    unit: 'USD',
    category: 'treasury',
    alternativeSource: 'Safe Transaction Service API'
  },

  treasuryComposition: {
    name: 'Treasury Asset Composition',
    formula: 'GROUP BY asset_type (ETH, stablecoins, COW, other tokens)',
    calculation: 'Breakdown of treasury holdings by asset type with USD values',
    source: 'Dune Analytics Query #3700123',
    endpoint: 'https://api.dune.com/api/v1/query/3700123/results',
    updateFrequency: '1 hour',
    unit: 'USD per asset',
    category: 'treasury',
    alternativeSource: 'Safe Transaction Service API'
  },

  monthlyRevenue: {
    name: 'Monthly DAO Revenue',
    formula: 'SUM(revenue_usd) GROUP BY month',
    calculation: 'Total revenue generated by CoW Protocol flowing to DAO treasury per month',
    source: 'Dune Analytics Query #3700123',
    endpoint: 'https://api.dune.com/api/v1/query/3700123/results',
    updateFrequency: '1 hour',
    unit: 'USD',
    category: 'treasury'
  },

  // Solver Metrics (Dune Analytics)
  activeSolvers: {
    name: 'Active Solvers',
    formula: 'COUNT(DISTINCT solver_address) from last 30 days',
    calculation: 'Number of unique solvers that won auctions in the last 30 days',
    source: 'Dune Analytics Query #5533118',
    endpoint: 'https://api.dune.com/api/v1/query/5533118/results',
    updateFrequency: '15 minutes',
    unit: 'count',
    category: 'solver'
  },

  solverRewards: {
    name: 'Solver Rewards',
    formula: 'SUM(reward_amount_cow) GROUP BY solver',
    calculation: 'Total COW tokens rewarded to solvers for winning auctions',
    source: 'Dune Analytics Query #5270914',
    endpoint: 'https://api.dune.com/api/v1/query/5270914/results',
    updateFrequency: '15 minutes',
    unit: 'COW tokens',
    category: 'solver'
  },

  // Safe Multisig Metrics
  safeBalance: {
    name: 'Safe Multisig Balance',
    formula: 'SUM(token_balance) from Safe API',
    calculation: 'Total balance of CoW DAO Safe multisig wallet',
    source: 'Safe Transaction Service API',
    endpoint: 'https://safe-transaction-mainnet.safe.global/api/v1/safes/{address}/balances',
    updateFrequency: '10 minutes',
    unit: 'USD',
    category: 'treasury'
  }
};

/**
 * Get metric definition by key
 */
export function getMetricDefinition(key) {
  return METRIC_DEFINITIONS[key] || null;
}

/**
 * Get all metrics for a category
 */
export function getMetricsByCategory(category) {
  return Object.entries(METRIC_DEFINITIONS)
    .filter(([, def]) => def.category === category)
    .reduce((acc, [key, def]) => {
      acc[key] = def;
      return acc;
    }, {});
}

/**
 * Get all available categories
 */
export function getCategories() {
  const categories = new Set();
  Object.values(METRIC_DEFINITIONS).forEach(def => {
    categories.add(def.category);
  });
  return Array.from(categories);
}

/**
 * Search metrics by name or description
 */
export function searchMetrics(query) {
  const lowerQuery = query.toLowerCase();
  return Object.entries(METRIC_DEFINITIONS)
    .filter(([key, def]) =>
      key.toLowerCase().includes(lowerQuery) ||
      def.name.toLowerCase().includes(lowerQuery) ||
      def.calculation.toLowerCase().includes(lowerQuery)
    )
    .reduce((acc, [key, def]) => {
      acc[key] = def;
      return acc;
    }, {});
}
