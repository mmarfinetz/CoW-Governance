import { useState, useEffect, useCallback } from 'react';
import { fetchProposals, fetchVotes } from '../services/snapshotService';
import { getCachedProposals } from '../services/cacheService';
import { useTimeRange } from '../contexts/TimeRangeContext';

/**
 * Hook to fetch detailed proposal data
 */
export function useProposalData(shouldFetch = true) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const { filterByTimeRange, dateRange } = useTimeRange();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const proposalData = await getCachedProposals(() => fetchProposals(100));

      // Process proposals to extract categories and metadata
      const processedProposals = proposalData.map(proposal => {
        // Extract CIP number from title
        const cipMatch = proposal.title.match(/CIP[- ]?(\d+)/i);
        const cipNumber = cipMatch ? cipMatch[0] : null;

        // Categorize proposals based on title/body keywords
        let category = 'Other';
        const titleLower = proposal.title.toLowerCase();
        const bodyLower = (proposal.body || '').toLowerCase();

        if (titleLower.includes('treasury') || bodyLower.includes('treasury')) {
          category = 'Treasury';
        } else if (titleLower.includes('solver') || bodyLower.includes('solver')) {
          category = 'Solver';
        } else if (titleLower.includes('grant') || bodyLower.includes('grant')) {
          category = 'Grants';
        } else if (titleLower.includes('legal') || titleLower.includes('structure')) {
          category = 'Legal/Structure';
        } else if (titleLower.includes('fee') || titleLower.includes('economic')) {
          category = 'Protocol Economics';
        } else if (titleLower.includes('slash') || bodyLower.includes('slash')) {
          category = 'Slashing';
        }

        // Calculate pass/fail status safely
        let passed = false;
        if (proposal.state === 'closed' && proposal.scores && proposal.scores.length > 0) {
          const maxScore = Math.max(...proposal.scores);
          const otherScores = proposal.scores_total - maxScore;
          passed = proposal.scores_total >= (proposal.quorum || 0) && maxScore > otherScores;
        }

        return {
          ...proposal,
          cipNumber,
          category,
          passed
        };
      });

      // Filter proposals by selected time range
      const filteredProposals = filterByTimeRange(processedProposals, 'created');

      setProposals(filteredProposals);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching proposal data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterByTimeRange]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, [shouldFetch, fetchData]);

  // Helper function to fetch votes for a specific proposal
  const fetchProposalVotes = async (proposalId) => {
    try {
      return await fetchVotes(proposalId);
    } catch (err) {
      console.error(`Error fetching votes for proposal ${proposalId}:`, err);
      throw err;
    }
  };

  return {
    proposals,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
    fetchProposalVotes
  };
}
