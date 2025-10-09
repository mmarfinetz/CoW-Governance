import { fetchProposal, fetchVotes } from './snapshotService';

/**
 * Chain mapping configuration
 * Maps Snapshot strategy names to blockchain networks
 */
const CHAIN_MAPPINGS = {
  // Ethereum Mainnet
  mainnet: [
    'erc20-balance-of',
    'erc20-votes',
    'delegation',
    'contract-call',
    'eth-balance',
    'balance-of',
    'multichain'
  ],
  // Gnosis Chain (formerly xDAI)
  gnosis: [
    'erc20-balance-of-gnosis',
    'erc20-balance-of-gnosis-chain',
    'gnosis',
    'xdai',
    'balance-of-gnosis'
  ],
  // Arbitrum
  arbitrum: [
    'erc20-balance-of-arbitrum',
    'arbitrum',
    'balance-of-arbitrum'
  ],
  // Base
  base: [
    'erc20-balance-of-base',
    'base',
    'balance-of-base'
  ],
  // Polygon
  polygon: [
    'erc20-balance-of-polygon',
    'polygon',
    'matic',
    'balance-of-polygon'
  ]
};

/**
 * Detect chain from Snapshot voting strategy
 * @param {Object} strategy - Snapshot voting strategy object
 * @returns {string} - Chain name (mainnet, gnosis, arbitrum, base, polygon, unknown)
 */
export function detectChainFromStrategy(strategy) {
  if (!strategy || !strategy.name) {
    return 'unknown';
  }

  const strategyName = strategy.name.toLowerCase();
  const strategyParams = strategy.params || {};

  // Check strategy params for explicit network/chainId
  if (strategyParams.network) {
    const network = strategyParams.network.toLowerCase();

    // Map network IDs to chain names
    const networkMap = {
      '1': 'mainnet',
      '100': 'gnosis',
      '42161': 'arbitrum',
      '8453': 'base',
      '137': 'polygon',
      'mainnet': 'mainnet',
      'gnosis': 'gnosis',
      'xdai': 'gnosis',
      'arbitrum': 'arbitrum',
      'arbitrum-one': 'arbitrum',
      'base': 'base',
      'polygon': 'polygon',
      'matic': 'polygon'
    };

    if (networkMap[network]) {
      return networkMap[network];
    }
  }

  // Check chainId parameter
  if (strategyParams.chainId) {
    const chainIdMap = {
      1: 'mainnet',
      100: 'gnosis',
      42161: 'arbitrum',
      8453: 'base',
      137: 'polygon'
    };

    if (chainIdMap[strategyParams.chainId]) {
      return chainIdMap[strategyParams.chainId];
    }
  }

  // Fallback: match strategy name against known patterns
  for (const [chain, patterns] of Object.entries(CHAIN_MAPPINGS)) {
    if (patterns.some(pattern => strategyName.includes(pattern))) {
      return chain;
    }
  }

  // Default to mainnet for common strategies without explicit chain
  if (strategyName.includes('erc20') ||
      strategyName.includes('balance') ||
      strategyName.includes('delegation')) {
    return 'mainnet';
  }

  return 'unknown';
}

/**
 * Aggregate voting power by chain from proposal data
 * @param {string} proposalId - Snapshot proposal ID
 * @returns {Promise<Object>} - Object with chain breakdown: { mainnet: X, gnosis: Y, ... }
 */
export async function aggregateVotingPowerByChain(proposalId) {
  try {
    // Fetch proposal with strategies and votes
    const [proposal, votes] = await Promise.all([
      fetchProposal(proposalId),
      fetchVotes(proposalId, 10000) // Fetch more votes for better aggregation
    ]);

    if (!proposal || !proposal.strategies) {
      console.warn(`No strategies found for proposal ${proposalId}`);
      return {
        mainnet: 0,
        gnosis: 0,
        arbitrum: 0,
        base: 0,
        polygon: 0,
        unknown: 0,
        totalVotingPower: 0,
        strategyDetails: []
      };
    }

    // Detect chains from strategies
    const strategyChains = proposal.strategies.map((strategy, index) => {
      const chain = detectChainFromStrategy(strategy);
      return {
        index,
        chain,
        strategyName: strategy.name,
        params: strategy.params
      };
    });

    console.log(`[Multi-Chain] Proposal ${proposalId} strategies:`, strategyChains);

    // Initialize chain totals
    const chainTotals = {
      mainnet: 0,
      gnosis: 0,
      arbitrum: 0,
      base: 0,
      polygon: 0,
      unknown: 0
    };

    // Aggregate voting power by chain
    // Each vote has vp_by_strategy array that corresponds to strategy index
    votes.forEach(vote => {
      if (!vote.vp_by_strategy || !Array.isArray(vote.vp_by_strategy)) {
        // Fallback to total vp if vp_by_strategy not available
        if (vote.vp && strategyChains.length > 0) {
          // Assign to first detected chain
          const firstChain = strategyChains[0].chain;
          chainTotals[firstChain] += vote.vp;
        }
        return;
      }

      vote.vp_by_strategy.forEach((votingPower, strategyIndex) => {
        if (strategyIndex < strategyChains.length) {
          const chain = strategyChains[strategyIndex].chain;
          chainTotals[chain] += votingPower || 0;
        }
      });
    });

    const totalVotingPower = Object.values(chainTotals).reduce((sum, vp) => sum + vp, 0);

    console.log(`[Multi-Chain] Proposal ${proposalId} voting power by chain:`, {
      ...chainTotals,
      totalVotingPower,
      totalVotes: votes.length
    });

    return {
      ...chainTotals,
      totalVotingPower,
      strategyDetails: strategyChains,
      totalVotes: votes.length
    };

  } catch (error) {
    console.error('Error aggregating voting power by chain:', error);
    return {
      mainnet: 0,
      gnosis: 0,
      arbitrum: 0,
      base: 0,
      polygon: 0,
      unknown: 0,
      totalVotingPower: 0,
      strategyDetails: [],
      error: error.message
    };
  }
}

/**
 * Analyze all proposals to get overall chain activity distribution
 * @param {Array} proposals - Array of Snapshot proposals
 * @returns {Promise<Object>} - Aggregated chain statistics across all proposals
 */
export async function analyzeChainDistribution(proposals) {
  if (!proposals || proposals.length === 0) {
    return {
      mainnet: 0,
      gnosis: 0,
      arbitrum: 0,
      base: 0,
      polygon: 0,
      unknown: 0,
      totalVotingPower: 0,
      proposalsAnalyzed: 0
    };
  }

  // Analyze a sample of recent proposals (limit to avoid excessive API calls)
  const recentProposals = proposals
    .filter(p => p.state === 'closed' && p.scores_total > 0)
    .slice(0, 20); // Analyze last 20 closed proposals

  console.log(`[Multi-Chain] Analyzing ${recentProposals.length} recent proposals for chain distribution`);

  const chainAggregates = {
    mainnet: 0,
    gnosis: 0,
    arbitrum: 0,
    base: 0,
    polygon: 0,
    unknown: 0,
    totalVotingPower: 0
  };

  // Aggregate voting power across proposals
  for (const proposal of recentProposals) {
    try {
      const chainData = await aggregateVotingPowerByChain(proposal.id);

      chainAggregates.mainnet += chainData.mainnet || 0;
      chainAggregates.gnosis += chainData.gnosis || 0;
      chainAggregates.arbitrum += chainData.arbitrum || 0;
      chainAggregates.base += chainData.base || 0;
      chainAggregates.polygon += chainData.polygon || 0;
      chainAggregates.unknown += chainData.unknown || 0;
      chainAggregates.totalVotingPower += chainData.totalVotingPower || 0;

    } catch (error) {
      console.warn(`Failed to analyze proposal ${proposal.id}:`, error);
    }
  }

  console.log(`[Multi-Chain] Overall chain distribution:`, chainAggregates);

  return {
    ...chainAggregates,
    proposalsAnalyzed: recentProposals.length
  };
}

/**
 * Get chain metadata for display
 */
export const CHAIN_METADATA = {
  mainnet: {
    name: 'Ethereum',
    shortName: 'Mainnet',
    color: '#3B82F6',
    icon: 'Ξ'
  },
  gnosis: {
    name: 'Gnosis Chain',
    shortName: 'Gnosis',
    color: '#10B981',
    icon: 'G'
  },
  arbitrum: {
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    color: '#F59E0B',
    icon: 'A'
  },
  base: {
    name: 'Base',
    shortName: 'Base',
    color: '#8B5CF6',
    icon: 'B'
  },
  polygon: {
    name: 'Polygon',
    shortName: 'Polygon',
    color: '#6366F1',
    icon: 'P'
  },
  unknown: {
    name: 'Unknown',
    shortName: 'Unknown',
    color: '#6B7280',
    icon: '?'
  }
};
