import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

const SNAPSHOT_API = API_CONFIG.snapshot.endpoint;
const COW_SPACE = API_CONFIG.snapshot.space;

/**
 * Fetch proposals from Snapshot for CoW DAO
 */
export async function fetchProposals(first = 100) {
  const query = `
    query Proposals {
      proposals(
        first: ${first},
        where: { space_in: ["${COW_SPACE}"] },
        orderBy: "created",
        orderDirection: desc
      ) {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_total
        scores_state
        quorum
        author
        created
        type
      }
    }
  `;

  try {
    console.log('[SnapshotService] Fetching from:', SNAPSHOT_API, `(space: ${COW_SPACE}, limit: ${first})`, new Date().toISOString());
    const response = await axios.post(SNAPSHOT_API, { query });
    const proposals = response.data.data.proposals;
    console.log('[SnapshotService] Received', proposals.length, 'proposals at', new Date().toISOString());
    return proposals;
  } catch (error) {
    console.error('Error fetching proposals from Snapshot:', error);
    throw error;
  }
}

/**
 * Fetch a single proposal by ID
 */
export async function fetchProposal(proposalId) {
  const query = `
    query Proposal {
      proposal(id: "${proposalId}") {
        id
        title
        body
        choices
        start
        end
        snapshot
        state
        scores
        scores_total
        scores_state
        quorum
        author
        created
        type
        strategies {
          name
          params
        }
      }
    }
  `;

  try {
    console.log('[SnapshotService] Fetching proposal from:', SNAPSHOT_API, `(id: ${proposalId})`, new Date().toISOString());
    const response = await axios.post(SNAPSHOT_API, { query });
    return response.data.data.proposal;
  } catch (error) {
    console.error('Error fetching proposal from Snapshot:', error);
    throw error;
  }
}

/**
 * Fetch votes for a specific proposal
 */
export async function fetchVotes(proposalId, first = 1000) {
  const query = `
    query Votes {
      votes(
        first: ${first},
        where: { proposal: "${proposalId}" },
        orderBy: "vp",
        orderDirection: desc
      ) {
        id
        voter
        vp
        vp_state
        created
        choice
      }
    }
  `;

  try {
    console.log('[SnapshotService] Fetching votes from:', SNAPSHOT_API, `(proposal: ${proposalId}, limit: ${first})`, new Date().toISOString());
    const response = await axios.post(SNAPSHOT_API, { query });
    const votes = response.data.data.votes;
    console.log('[SnapshotService] Received', votes.length, 'votes at', new Date().toISOString());
    return votes;
  } catch (error) {
    console.error('Error fetching votes from Snapshot:', error);
    throw error;
  }
}

/**
 * Fetch Snapshot space information for CoW DAO
 */
export async function fetchSpaceInfo() {
  const query = `
    query Space {
      space(id: "${COW_SPACE}") {
        id
        name
        about
        network
        symbol
        members
        admins
        categories
        avatar
        voting {
          delay
          period
          quorum
          type
        }
        strategies {
          name
          params
        }
        validation {
          name
          params
        }
      }
    }
  `;

  try {
    console.log('[SnapshotService] Fetching space info from:', SNAPSHOT_API, `(space: ${COW_SPACE})`, new Date().toISOString());
    const response = await axios.post(SNAPSHOT_API, { query });
    return response.data.data.space;
  } catch (error) {
    console.error('Error fetching space info from Snapshot:', error);
    throw error;
  }
}

/**
 * Fetch voting strategies for a specific proposal
 */
export async function fetchVotingStrategies(proposalId) {
  const query = `
    query ProposalStrategies {
      proposal(id: "${proposalId}") {
        id
        strategies {
          name
          network
          params
        }
      }
    }
  `;

  try {
    const response = await axios.post(SNAPSHOT_API, { query });
    return response.data.data.proposal?.strategies || [];
  } catch (error) {
    console.error('Error fetching voting strategies from Snapshot:', error);
    throw error;
  }
}

/**
 * Calculate governance metrics from proposals
 * Now includes chain breakdown placeholder (populated by separate service)
 */
export function calculateGovernanceMetrics(proposals, chainBreakdown = null) {
  if (!proposals || proposals.length === 0) {
    return {
      totalProposals: 0,
      activeProposals: 0,
      averageParticipation: 0,
      maxVotes: 0,
      successRate: 0,
      chainBreakdown: {
        mainnet: 0,
        gnosis: 0,
        arbitrum: 0,
        base: 0,
        polygon: 0,
        unknown: 0
      }
    };
  }

  const activeProposals = proposals.filter(p => p.state === 'active').length;

  // Calculate average participation from closed proposals
  const closedProposals = proposals.filter(p => p.state === 'closed' && p.scores_total);
  const avgParticipation = closedProposals.length > 0
    ? closedProposals.reduce((sum, p) => sum + p.scores_total, 0) / closedProposals.length
    : 0;

  // Find max votes ever recorded
  const maxVotes = Math.max(...proposals.map(p => p.scores_total || 0));

  // Calculate success rate (proposals that passed vs total)
  const passedProposals = proposals.filter(p => {
    if (p.state !== 'closed' || !p.scores || !p.quorum) return false;
    const topScore = Math.max(...p.scores);
    return p.scores_total >= p.quorum && topScore > (p.scores_total - topScore);
  }).length;

  const successRate = closedProposals.length > 0
    ? (passedProposals / closedProposals.length) * 100
    : 0;

  return {
    totalProposals: proposals.length,
    activeProposals,
    averageParticipation: avgParticipation,
    maxVotes,
    successRate,
    chainBreakdown: chainBreakdown || {
      mainnet: 0,
      gnosis: 0,
      arbitrum: 0,
      base: 0,
      polygon: 0,
      unknown: 0
    }
  };
}
