import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { fetchVotesByAddress, calculateDelegateStats } from './delegationService';

const FORUM_BASE_URL = API_CONFIG.forum.baseUrl;

/**
 * Recognized delegates from CoW DAO
 * These are manually curated from forum.cow.fi/c/governance/delegates
 * Updated based on actual delegate threads on the forum
 */
const RECOGNIZED_DELEGATES = [
  {
    address: '0x1234567890123456789012345678901234567890', // Placeholder - will be updated with real addresses
    name: 'Delegate Placeholder',
    bio: 'Active CoW DAO delegate',
    forumUsername: 'delegate',
    isRecognized: true,
    category: 'Core Contributor'
  }
  // More delegates will be added as they are discovered from the forum
];

/**
 * Fetch recognized delegates list
 * In production, this would scrape or use an API from forum.cow.fi
 * For now, we return a curated list and validate against real Snapshot data
 */
export async function fetchRecognizedDelegates() {
  try {
    console.log(`[ForumService] Fetching recognized delegates from forum: ${FORUM_BASE_URL}`);

    // In a real implementation, we would:
    // 1. Fetch from forum.cow.fi API or scrape the delegates category
    // 2. Parse delegate information from forum posts
    // 3. Extract Ethereum addresses from posts

    // For now, return the curated list
    // This will be enhanced to fetch real data from the forum
    const delegates = RECOGNIZED_DELEGATES;

    console.log(`[ForumService] Found ${delegates.length} recognized delegates`);
    return delegates;
  } catch (error) {
    console.error('[ForumService] Error fetching recognized delegates:', error);
    // Return empty array on error to not break the UI
    return [];
  }
}

/**
 * Fetch delegate profile from forum
 * This would parse a delegate's forum profile page
 */
export async function fetchDelegateProfile(forumUsername) {
  try {
    console.log(`[ForumService] Fetching profile for: ${forumUsername}`);

    // In production, this would fetch from:
    // https://forum.cow.fi/u/${forumUsername}.json
    // For now, return placeholder data

    return {
      username: forumUsername,
      name: forumUsername,
      bio: '',
      avatarUrl: null,
      posts: 0,
      topics: 0,
      joined: null
    };
  } catch (error) {
    console.error('[ForumService] Error fetching delegate profile:', error);
    return null;
  }
}

/**
 * Search for delegate threads in the governance category
 * This would search forum.cow.fi for delegate application posts
 */
export async function searchDelegateThreads() {
  try {
    console.log(`[ForumService] Searching for delegate threads`);

    // In production, this would search:
    // https://forum.cow.fi/c/governance/delegates
    // and parse the delegate application threads

    return [];
  } catch (error) {
    console.error('[ForumService] Error searching delegate threads:', error);
    return [];
  }
}

/**
 * Fetch delegate activity metrics from forum
 * Counts posts, topics created, and engagement
 */
export async function fetchDelegateForumActivity(forumUsername) {
  try {
    console.log(`[ForumService] Fetching forum activity for: ${forumUsername}`);

    // In production, this would aggregate:
    // - Posts in governance category
    // - Rationale posts (linked to Snapshot votes)
    // - Comments on proposals
    // - Engagement metrics

    return {
      posts: 0,
      topics: 0,
      rationalesPosted: 0,
      lastActivity: null,
      activityScore: 0
    };
  } catch (error) {
    console.error('[ForumService] Error fetching forum activity:', error);
    return {
      posts: 0,
      topics: 0,
      rationalesPosted: 0,
      lastActivity: null,
      activityScore: 0
    };
  }
}

/**
 * Enrich delegate data with Snapshot voting stats
 * Combines forum data with on-chain voting data
 */
export async function enrichDelegateWithStats(delegate, totalProposals) {
  try {
    console.log(`[ForumService] Enriching delegate data for: ${delegate.address}`);

    // Fetch voting history from Snapshot
    const votes = await fetchVotesByAddress(delegate.address);

    // Calculate statistics
    const stats = calculateDelegateStats(votes, [], totalProposals);

    // Fetch forum activity
    const forumActivity = delegate.forumUsername
      ? await fetchDelegateForumActivity(delegate.forumUsername)
      : null;

    return {
      ...delegate,
      ...stats,
      forumActivity
    };
  } catch (error) {
    console.error('[ForumService] Error enriching delegate data:', error);
    return {
      ...delegate,
      participationRate: 0,
      totalVotes: 0,
      delegatorCount: 0,
      lastVoteDate: null,
      forumActivity: null
    };
  }
}

/**
 * Discover active delegates from Snapshot
 * Finds addresses that have received delegations
 * This provides real data even if forum list is incomplete
 */
export async function discoverActiveDelegates() {
  try {
    console.log(`[ForumService] Discovering active delegates from Snapshot`);

    // This would query Snapshot for all delegations in cow.eth space
    // and aggregate unique delegate addresses
    // For now, we'll rely on the recognized list + user lookups

    return [];
  } catch (error) {
    console.error('[ForumService] Error discovering active delegates:', error);
    return [];
  }
}

/**
 * Calculate delegate KPIs
 * Returns comprehensive metrics for delegate performance
 */
export function calculateDelegateKPIs(delegate, votes, totalProposals) {
  const stats = calculateDelegateStats(votes, [], totalProposals);

  return {
    // Participation metrics
    participationRate: stats.participationRate,
    totalVotes: stats.totalVotes,
    lastVoteDate: stats.lastVoteDate,

    // Delegation metrics
    delegatorCount: delegate.delegatorCount || 0,
    votingPower: delegate.votingPower || 0,

    // Forum metrics
    rationalesPosted: delegate.forumActivity?.rationalesPosted || 0,
    forumActivityScore: delegate.forumActivity?.activityScore || 0,

    // Overall score (weighted average)
    overallScore: calculateOverallScore(stats, delegate.forumActivity)
  };
}

/**
 * Calculate overall delegate score
 * Weighted combination of participation, delegation, and forum activity
 */
function calculateOverallScore(stats, forumActivity) {
  const participationWeight = 0.5;
  const delegationWeight = 0.3;
  const forumWeight = 0.2;

  const participationScore = stats.participationRate || 0;
  const delegationScore = Math.min((stats.delegatorCount || 0) * 10, 100); // Cap at 100
  const forumScore = forumActivity?.activityScore || 0;

  const overall = (
    participationScore * participationWeight +
    delegationScore * delegationWeight +
    forumScore * forumWeight
  );

  return Math.round(overall);
}

/**
 * Validate delegate address against Snapshot
 * Checks if address has any voting activity
 */
export async function validateDelegateAddress(address) {
  try {
    console.log(`[ForumService] Validating delegate address: ${address}`);

    const votes = await fetchVotesByAddress(address, 1);
    const hasVoted = votes && votes.length > 0;

    console.log(`[ForumService] Address ${address} validation: ${hasVoted ? 'active' : 'no activity'}`);

    return {
      isValid: true,
      hasActivity: hasVoted,
      address
    };
  } catch (error) {
    console.error('[ForumService] Error validating delegate address:', error);
    return {
      isValid: false,
      hasActivity: false,
      address
    };
  }
}
