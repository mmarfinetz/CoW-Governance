import { useState, useEffect, useCallback } from 'react';
import { fetchProposals } from '../services/snapshotService';

/**
 * Hook to fetch and manage active proposals with auto-refresh
 * Filters proposals where state === "active" and calculates time remaining
 */
export function useActiveProposals() {
  const [activeProposals, setActiveProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch fresh proposals (no cache for active proposals to ensure real-time data)
      const proposals = await fetchProposals(100);

      // Filter only active proposals
      const active = proposals
        .filter(p => p.state === 'active')
        .map(proposal => {
          const now = Math.floor(Date.now() / 1000); // Current time in seconds
          const endTime = proposal.end;
          const timeRemaining = endTime - now;

          // Calculate quorum progress percentage
          const quorum = proposal.quorum || 0;
          const totalVotes = proposal.scores_total || 0;
          const quorumProgress = quorum > 0 ? (totalVotes / quorum) * 100 : 0;

          return {
            ...proposal,
            timeRemaining: Math.max(0, timeRemaining), // Ensure non-negative
            quorumProgress: Math.min(100, quorumProgress), // Cap at 100%
            hasMetQuorum: totalVotes >= quorum
          };
        });

      setActiveProposals(active);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching active proposals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return {
    activeProposals,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
