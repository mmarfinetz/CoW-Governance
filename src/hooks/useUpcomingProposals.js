import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Fetch upcoming proposals from CoW Protocol forum
 * Note: This is a best-effort scrape and may fail gracefully
 */
async function fetchForumProposals() {
  try {
    // Try to fetch from the forum's JSON API
    const response = await axios.get(`${API_CONFIG.forum.apiBaseUrl}/c/proposals/6.json`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.topic_list && response.data.topic_list.topics) {
      const topics = response.data.topic_list.topics;

      // Parse topics to extract upcoming proposal information
      const upcomingProposals = topics
        .filter(topic => {
          const title = topic.title.toLowerCase();
          // Filter for proposal-related topics
          return (
            title.includes('proposal') ||
            title.includes('cip') ||
            title.includes('vote') ||
            title.includes('snapshot')
          );
        })
        .slice(0, 10) // Limit to 10 most recent
        .map(topic => ({
          id: topic.id,
          title: topic.title,
          url: `${API_CONFIG.forum.baseUrl}/t/${topic.slug}/${topic.id}`,
          created: new Date(topic.created_at),
          author: topic.posters?.[0]?.user_id || 'Unknown',
          replies: topic.posts_count - 1,
          views: topic.views,
          excerpt: topic.excerpt || '',
          // Try to extract CIP number
          cipNumber: topic.title.match(/CIP[- ]?(\d+)/i)?.[0] || null,
          // Estimate if it's upcoming based on recent activity
          isUpcoming: topic.bumped_at &&
                     (new Date(topic.bumped_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        }))
        .filter(p => p.isUpcoming); // Only keep recently active topics

      return upcomingProposals;
    }

    return [];
  } catch (error) {
    console.warn('Failed to fetch forum proposals (this is expected if CORS blocks):', error.message);
    // Return empty array instead of throwing - graceful degradation
    return [];
  }
}

/**
 * Hook to fetch upcoming proposals from forum
 * This implements graceful degradation if forum scraping fails
 */
export function useUpcomingProposals() {
  const [upcomingProposals, setUpcomingProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const proposals = await fetchForumProposals();

      setUpcomingProposals(proposals);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching upcoming proposals:', err);
      // Set a user-friendly error message
      setError('Unable to fetch forum data. Forum proposals may not be available.');
      setUpcomingProposals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    upcomingProposals,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  };
}
