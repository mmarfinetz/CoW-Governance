import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SectionHeader } from '../shared/SectionHeader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { DataTable } from '../shared/DataTable';
import { Badge } from '../shared/Badge';
import { ChartContainer } from '../shared/ChartContainer';
import { useProposalData } from '../../hooks/useProposalData';
import { useTimeRange } from '../../contexts/TimeRangeContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function ProposalAnalytics() {
  const [isVisible, setIsVisible] = useState(false);

  // Only fetch data when component becomes visible
  const { proposals, loading, error, refetch } = useProposalData(isVisible);
  const { getFormattedRange } = useTimeRange();

  // Set visibility when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Show loading placeholder if data not yet loaded
  if (!isVisible || (!proposals.length && !error)) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Proposal Analytics" />
        <LoadingSpinner message="Initializing proposal analytics..." />
      </div>
    );
  }

  // Process data for charts
  const { timelineData, categoryData, recentProposals } = useMemo(() => {
    if (!proposals || proposals.length === 0) {
      return { timelineData: [], categoryData: [], recentProposals: [] };
    }

    // Timeline data - group by month
    const timelineMap = {};
    proposals.forEach(p => {
      const date = new Date(p.created * 1000);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      timelineMap[month] = (timelineMap[month] || 0) + 1;
    });

    const timeline = Object.entries(timelineMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, count]) => ({ month, proposals: count }));

    // Category breakdown
    const categoryMap = {};
    proposals.forEach(p => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    // Recent proposals (last 10)
    const recent = proposals.slice(0, 10);

    return {
      timelineData: timeline,
      categoryData: categories,
      recentProposals: recent
    };
  }, [proposals]);

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Proposal Activity & Voting Trends" />
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Proposal Activity & Voting Trends" />
        <LoadingSpinner message="Loading proposal data..." />
      </div>
    );
  }

  const hasData = proposals && proposals.length > 0;

  const columns = [
    {
      key: 'title',
      label: 'Proposal',
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.cipNumber || 'N/A'}</div>
          <div className="text-xs text-gray-500 truncate max-w-md">{value}</div>
        </div>
      ),
      sortable: false
    },
    {
      key: 'scores_total',
      label: 'Votes',
      render: (value) => value ? `${(value / 1000000).toFixed(2)}M` : '0'
    },
    {
      key: 'state',
      label: 'Status',
      render: (value, row) => {
        if (value === 'active') return <Badge variant="active">Active</Badge>;
        if (value === 'closed') {
          return row.passed ? <Badge variant="passed">Passed</Badge> : <Badge variant="failed">Failed</Badge>;
        }
        return <Badge variant="default">{value}</Badge>;
      }
    },
    {
      key: 'category',
      label: 'Category',
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    {
      key: 'created',
      label: 'Date',
      render: (value) => new Date(value * 1000).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Proposal Activity & Voting Trends"
        subtitle={hasData ? `Analysis of ${proposals.length} CoW DAO proposals` : 'Proposal analytics and voting trends'}
      />

      {/* Date Range Subtitle */}
      <div className="text-sm text-gray-600 -mt-3 mb-2">
        Showing data from <span className="font-semibold">{getFormattedRange()}</span>
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 text-center">
            No proposal data found for the selected time period. Try selecting a different date range.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <ChartContainer
          title="Proposal Timeline"
          subtitle="Proposals submitted over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="proposals" fill="#3B82F6" name="Proposals" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Category Breakdown */}
        <ChartContainer
          title="Proposals by Category"
          subtitle="Distribution across proposal types"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        </div>
      )}

      {/* Voting Participation Chart */}
      {hasData && (
        <ChartContainer
        title="Voting Participation"
        subtitle="Vote counts vs quorum requirement (35M)"
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={recentProposals.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="cipNumber"
              label={{ value: 'Proposal', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Votes (Millions)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => (value / 1000000).toFixed(0)}
            />
            <Tooltip
              formatter={(value) => [(value / 1000000).toFixed(2) + 'M', 'Votes']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="scores_total"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Total Votes"
            />
            <Line
              type="monotone"
              dataKey={() => 35000000}
              stroke="#EF4444"
              strokeDasharray="5 5"
              name="Quorum (35M)"
            />
          </LineChart>
        </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Recent Proposals Table */}
      {hasData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Proposals</h3>
          <DataTable
            columns={columns}
            data={recentProposals}
            defaultSortKey="created"
          />
        </div>
      )}
    </div>
  );
}
