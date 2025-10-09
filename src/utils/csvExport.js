/**
 * CSV Export Utility
 * Exports vote data to CSV format with proper formatting
 */

/**
 * Converts votes array to CSV and triggers download
 * @param {Array} votes - Array of vote objects from Snapshot
 * @param {string} proposalTitle - Title of the proposal for filename
 */
export function exportVotesToCSV(votes, proposalTitle) {
  if (!votes || votes.length === 0) {
    alert('No votes to export');
    return;
  }

  // Define CSV headers
  const headers = ['Voter Address', 'Voting Power', 'Choice', 'Timestamp'];

  // Convert votes to CSV rows
  const rows = votes.map(vote => {
    // Format voting power as fixed decimal (no scientific notation)
    const votingPower = vote.vp ? vote.vp.toFixed(2) : '0';

    // Format timestamp
    const timestamp = vote.created
      ? new Date(vote.created * 1000).toLocaleString()
      : 'Unknown';

    // Format choice (can be number or array)
    let choice = '';
    if (typeof vote.choice === 'number') {
      choice = `Choice ${vote.choice}`;
    } else if (Array.isArray(vote.choice)) {
      choice = vote.choice.join(', ');
    } else {
      choice = String(vote.choice);
    }

    return [
      vote.voter,
      votingPower,
      choice,
      timestamp
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Generate filename from proposal title
  const sanitizedTitle = proposalTitle
    .replace(/[^a-z0-9]/gi, '_')
    .substring(0, 50);
  const filename = `votes_${sanitizedTitle}_${Date.now()}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format a number for display (no scientific notation)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
}
