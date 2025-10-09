import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Download, User, Calendar, Clock } from 'lucide-react';
import { fetchProposal, fetchVotes } from '../../services/snapshotService';
import { VoterTable } from './VoterTable';
import { QuorumProgressBar } from './QuorumProgressBar';
import { Badge } from '../shared/Badge';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { exportVotesToCSV } from '../../utils/csvExport';

/**
 * ProposalDetailView component
 * Modal/drawer displaying full proposal details with voting data
 */
export function ProposalDetailView({ proposalId, onClose }) {
  const [proposal, setProposal] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch proposal details and votes in parallel
        const [proposalData, votesData] = await Promise.all([
          fetchProposal(proposalId),
          fetchVotes(proposalId, 1000) // Fetch up to 1000 votes
        ]);

        setProposal(proposalData);
        setVotes(votesData || []);
      } catch (err) {
        console.error('Error fetching proposal details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  // Extract Tenderly simulation link from proposal body
  const extractTenderlyLink = (body) => {
    if (!body) return null;

    // Match Tenderly URLs
    const tenderlyRegex = /https:\/\/(?:www\.)?tenderly\.co\/[^\s)]+/g;
    const matches = body.match(tenderlyRegex);

    return matches && matches.length > 0 ? matches[0] : null;
  };

  // Format markdown for display (basic markdown rendering)
  const renderMarkdown = (text) => {
    if (!text) return null;

    // Basic markdown transformations
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h2 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h2>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={index} className="text-xl font-semibold mt-3 mb-2">{line.substring(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={index} className="text-lg font-semibold mt-2 mb-1">{line.substring(4)}</h4>;
        }

        // Links
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const lineWithLinks = line.replace(linkRegex, (match, text, url) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${text}</a>`;
        });

        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return <li key={index} className="ml-6">{line.substring(2)}</li>;
        }

        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }

        // Regular paragraph
        return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: lineWithLinks }} />;
      });
  };

  // Calculate choice breakdown
  const getChoiceBreakdown = () => {
    if (!proposal || !proposal.choices || !proposal.scores) return [];

    return proposal.choices.map((choice, index) => ({
      choice,
      votes: proposal.scores[index] || 0,
      percentage: proposal.scores_total > 0
        ? ((proposal.scores[index] || 0) / proposal.scores_total * 100).toFixed(1)
        : 0
    }));
  };

  // Handle CSV export
  const handleExportCSV = () => {
    if (votes.length === 0) {
      alert('No votes to export');
      return;
    }

    exportVotesToCSV(votes, proposal.title);
  };

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tenderlyLink = proposal ? extractTenderlyLink(proposal.body) : null;
  const choiceBreakdown = getChoiceBreakdown();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Proposal Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <LoadingSpinner message="Loading proposal details..." />}

          {error && <ErrorMessage message={error} />}

          {!loading && !error && proposal && (
            <div className="space-y-6">
              {/* Title and Status */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={proposal.state === 'active' ? 'active' : 'closed'}>
                    {proposal.state.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {proposal.type || 'single-choice'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{proposal.title}</h3>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Author</p>
                    <p className="text-sm font-mono text-gray-900">
                      {proposal.author.substring(0, 6)}...{proposal.author.substring(proposal.author.length - 4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Start Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(proposal.start * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">End Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(proposal.end * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quorum Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Voting Progress</h4>
                <QuorumProgressBar
                  currentVotes={proposal.scores_total || 0}
                  quorum={proposal.quorum || 0}
                />
              </div>

              {/* Choice Breakdown */}
              {choiceBreakdown.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Vote Distribution</h4>
                  <div className="space-y-2">
                    {choiceBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-900">{item.choice}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenderly Link */}
              {tenderlyLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <a
                    href={tenderlyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink size={18} />
                    View Tenderly Simulation
                  </a>
                </div>
              )}

              {/* Proposal Body */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {renderMarkdown(proposal.body)}
                </div>
              </div>

              {/* Voter Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Votes ({votes.length})
                  </h4>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Download size={18} />
                    Export to CSV
                  </button>
                </div>

                {votes.length > 0 ? (
                  <VoterTable votes={votes} choices={proposal.choices} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No votes yet for this proposal
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
