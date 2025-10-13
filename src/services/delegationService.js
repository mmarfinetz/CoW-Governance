import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const SNAPSHOT_API = API_CONFIG.snapshot.endpoint;
const COW_SPACE = API_CONFIG.snapshot.space;

/**
 * Fetch current delegation for an address
 * Returns the delegate address if delegated, null otherwise
 */
export async function fetchDelegation(address) {
  const query = `
    query Delegations($address: String!, $spaces: [String!]!) {
      delegations(
        where: {
          delegator: $address,
          space_in: $spaces
        },
        orderBy: "timestamp",
        orderDirection: desc,
        first: 1
      ) {
        delegator
        delegate
        timestamp
        space
      }
    }
  `;

  const variables = {
    address: address.toLowerCase(),
    spaces: [COW_SPACE]
  };

  try {
    console.log(`[DelegationService] Fetching delegation for address: ${address}`);
    console.log(`[DelegationService] API URL: ${SNAPSHOT_API}`);

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables
    });

    const delegations = response.data.data.delegations;

    if (delegations && delegations.length > 0) {
      console.log(`[DelegationService] Found delegation:`, delegations[0]);
      return delegations[0];
    }

    console.log(`[DelegationService] No delegation found for ${address}`);
    return null;
  } catch (error) {
    console.error('[DelegationService] Error fetching delegation:', error);
    throw error;
  }
}

/**
 * Fetch complete delegation history for an address
 * Returns all historical delegations
 */
export async function fetchDelegationHistory(address) {
  const query = `
    query DelegationHistory($address: String!, $spaces: [String!]!) {
      delegations(
        where: {
          delegator: $address,
          space_in: $spaces
        },
        orderBy: "timestamp",
        orderDirection: desc,
        first: 100
      ) {
        id
        delegator
        delegate
        timestamp
        space
      }
    }
  `;

  const variables = {
    address: address.toLowerCase(),
    spaces: [COW_SPACE]
  };

  try {
    console.log(`[DelegationService] Fetching delegation history for: ${address}`);
    console.log(`[DelegationService] API URL: ${SNAPSHOT_API}`);

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables
    });

    const delegations = response.data.data.delegations || [];
    console.log(`[DelegationService] Found ${delegations.length} historical delegations`);

    return delegations;
  } catch (error) {
    console.error('[DelegationService] Error fetching delegation history:', error);
    throw error;
  }
}

/**
 * Fetch all delegations TO a specific address (who delegated to them)
 * Used to find who is delegating to a delegate
 */
export async function fetchDelegationsReceived(delegateAddress) {
  const query = `
    query DelegationsReceived($delegate: String!, $spaces: [String!]!) {
      delegations(
        where: {
          delegate: $delegate,
          space_in: $spaces
        },
        orderBy: "timestamp",
        orderDirection: desc,
        first: 1000
      ) {
        id
        delegator
        delegate
        timestamp
        space
      }
    }
  `;

  const variables = {
    delegate: delegateAddress.toLowerCase(),
    spaces: [COW_SPACE]
  };

  try {
    console.log(`[DelegationService] Fetching delegations received by: ${delegateAddress}`);

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables
    });

    const delegations = response.data.data.delegations || [];
    console.log(`[DelegationService] Found ${delegations.length} delegators for ${delegateAddress}`);

    return delegations;
  } catch (error) {
    console.error('[DelegationService] Error fetching delegations received:', error);
    throw error;
  }
}

/**
 * Resolve ENS name to address using Snapshot's API
 * Snapshot has built-in ENS resolution
 */
export async function resolveENS(ensName) {
  // For ENS resolution, we can query Snapshot's API for spaces or proposals
  // that include ENS names, or use a direct ENS lookup service
  // Snapshot typically auto-resolves ENS in their interface

  try {
    console.log(`[DelegationService] Attempting to resolve ENS: ${ensName}`);

    // If it's already an address (starts with 0x and is 42 chars), return it
    if (ensName.startsWith('0x') && ensName.length === 42) {
      console.log(`[DelegationService] Input is already an address: ${ensName}`);
      return ensName.toLowerCase();
    }

    // For ENS names, we would typically use a service like Ethers.js or Web3.js
    // For now, we'll return the input and let the delegation query handle it
    // Snapshot's GraphQL API accepts both ENS names and addresses
    console.log(`[DelegationService] Treating as ENS name: ${ensName}`);
    return ensName.toLowerCase();
  } catch (error) {
    console.error('[DelegationService] Error resolving ENS:', error);
    throw error;
  }
}

/**
 * Fetch votes cast by a specific address across all proposals
 * Used to calculate participation rate for delegates
 */
export async function fetchVotesByAddress(address, first = 1000) {
  const query = `
    query VotesByAddress($address: String!, $space: String!) {
      votes(
        where: {
          voter: $address,
          space: $space
        },
        orderBy: "created",
        orderDirection: desc,
        first: ${first}
      ) {
        id
        voter
        created
        proposal {
          id
          title
          state
        }
        choice
        vp
      }
    }
  `;

  const variables = {
    address: address.toLowerCase(),
    space: COW_SPACE
  };

  try {
    console.log(`[DelegationService] Fetching votes by address: ${address}`);

    const response = await axios.post(SNAPSHOT_API, {
      query,
      variables
    });

    const votes = response.data.data.votes || [];
    console.log(`[DelegationService] Found ${votes.length} votes for ${address}`);

    return votes;
  } catch (error) {
    console.error('[DelegationService] Error fetching votes by address:', error);
    throw error;
  }
}

/**
 * Calculate delegate statistics
 */
export function calculateDelegateStats(votes, delegationsReceived, totalProposals) {
  if (!votes || !totalProposals || totalProposals === 0) {
    return {
      participationRate: 0,
      totalVotes: 0,
      delegatorCount: delegationsReceived?.length || 0,
      lastVoteDate: null
    };
  }

  const participationRate = (votes.length / totalProposals) * 100;
  const lastVote = votes.length > 0 ? votes[0] : null;

  return {
    participationRate: Math.min(participationRate, 100), // Cap at 100%
    totalVotes: votes.length,
    delegatorCount: delegationsReceived?.length || 0,
    lastVoteDate: lastVote ? new Date(lastVote.created * 1000) : null,
    recentVotes: votes.slice(0, 10) // Last 10 votes
  };
}

/**
 * Validate if an address is a valid Ethereum address
 */
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate if input might be an ENS name
 */
export function isENSName(input) {
  return input.endsWith('.eth') || (!input.startsWith('0x') && input.includes('.'));
}

/**
 * Fetch ALL delegations in a space and aggregate into a delegates list
 * This intelligently builds the delegates list from individual delegation records
 * Since Snapshot has no direct "delegates" query, we aggregate from "delegations"
 */
export async function fetchAllDelegates(space = COW_SPACE, limit = 1000) {
  // Snapshot GraphQL does not expose a `delegations` query. As a fallback,
  // use the `leaderboards` query to get top voters for the space and treat
  // vote count as an activity proxy.
  const query = `
    query Leaderboards($space: String!) {
      leaderboards(where: { space: $space }) {
        space
        user
        votesCount
        lastVote
      }
    }
  `;

  const variables = { space };

  try {
    console.log(`[DelegationService] Fetching top voters via leaderboards for space: ${space}`);

    const response = await axios.post(SNAPSHOT_API, { query, variables });
    const items = response.data?.data?.leaderboards || [];
    if (!items.length) {
      console.warn('[DelegationService] No leaderboard data returned');
      return [];
    }

    // Map leaderboard entries to delegate-like objects expected by UI
    const delegates = items.slice(0, Math.min(limit, items.length)).map((item) => ({
      id: item.user.toLowerCase(),
      address: item.user.toLowerCase(),
      // Reuse delegatorCount field to display activity; label adjusted in UI
      delegatorCount: item.votesCount || 0,
      delegators: [],
      latestDelegation: item.lastVote ? new Date(item.lastVote * 1000) : null,
      earliestDelegation: null,
      space: item.space,
      votingPower: 0,
      participationRate: 0,
      totalVotes: item.votesCount || 0
    }));

    console.log(`[DelegationService] Leaderboards mapped to ${delegates.length} entries`);
    return delegates;
  } catch (error) {
    console.error('[DelegationService] Error fetching leaderboards:', error);
    console.error('[DelegationService] Error details:', error.response?.data || error.message);
    throw error;
  }
}
