import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, DollarSign, Settings, ChevronDown, ChevronUp, Info, Users, Activity } from 'lucide-react';
import { GovernanceOverview } from './components/sections/GovernanceOverview';
import { ProposalAnalytics } from './components/sections/ProposalAnalytics';
import { TreasuryDashboard } from './components/sections/TreasuryDashboard';
import { DelegationDashboard } from './components/sections/DelegationDashboard';
import { LiveGovernance } from './components/sections/LiveGovernance';
import { ConfigurationModal } from './components/modals/ConfigurationModal';
import { TimeRangeProvider } from './contexts/TimeRangeContext';
import { CONFIG_VERSION, API_CONFIG } from './config/apiConfig';
import { runStartupValidation } from './utils/configValidator';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState(false);
  const [lastDataRefresh, setLastDataRefresh] = useState(new Date());

  // Run configuration validation on startup (DISABLED reconciliation to prevent rate limits)
  useEffect(() => {
    runStartupValidation();
    // DISABLED: Too many API calls causing rate limits
    // startReconciliation();
  }, []);

  // Update last refresh timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastDataRefresh(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'proposals', label: 'Proposals', icon: BarChart3 },
    { id: 'treasury', label: 'Treasury', icon: DollarSign },
    { id: 'delegation', label: 'Delegation', icon: Users },
    { id: 'live', label: 'Live', icon: Activity },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <GovernanceOverview />;
      case 'proposals':
        return <ProposalAnalytics />;
      case 'treasury':
        return <TreasuryDashboard />;
      case 'delegation':
        return <DelegationDashboard />;
      case 'live':
        return <LiveGovernance />;
      default:
        return <GovernanceOverview />;
    }
  };

  return (
    <TimeRangeProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Shield className="text-blue-600 mr-3" size={32} />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CoW DAO Governance Dashboard</h1>
                  <p className="text-xs text-gray-500">Real-time governance analytics</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Powered by</p>
                  <p className="text-sm font-semibold text-gray-700">Snapshot • Dune • CoinGecko</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-4 border-b-2 font-medium text-sm transition ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>

        {/* Enhanced Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Main Footer Content */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-500">
                  <p className="font-semibold text-gray-700">CoW DAO Governance Dashboard</p>
                  <p className="text-xs mt-1">Real-time data from public APIs</p>
                </div>

                {/* Version Badge */}
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-blue-900">
                      Config v{CONFIG_VERSION}
                    </span>
                  </div>
                </div>

                {/* Environment Badge */}
                <div className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-700 capitalize">
                      {import.meta.env.MODE || 'production'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Last Refresh */}
                <div className="text-xs text-gray-500">
                  Updated: {lastDataRefresh.toLocaleTimeString()}
                </div>

                {/* Configuration Button */}
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center text-sm font-medium"
                >
                  <Settings size={16} className="mr-2" />
                  Configuration
                </button>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setFooterExpanded(!footerExpanded)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition"
                  title={footerExpanded ? 'Collapse' : 'Expand'}
                >
                  {footerExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {/* Expanded Footer Content */}
            {footerExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-6">
                  {/* API Endpoints */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <Info size={14} className="mr-1" />
                      API Endpoints
                    </h4>
                    <div className="space-y-1.5">
                      <div className="text-xs">
                        <span className="text-gray-500">Snapshot:</span>{' '}
                        <a
                          href={API_CONFIG.snapshot.endpoint}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono"
                          title={API_CONFIG.snapshot.endpoint}
                        >
                          hub.snapshot.org
                        </a>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Dune:</span>{' '}
                        <span className="text-gray-700 font-mono" title={API_CONFIG.dune.baseUrl}>
                          api.dune.com
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">CoinGecko:</span>{' '}
                        <span className="text-gray-700 font-mono" title={API_CONFIG.coinGecko.baseUrl}>
                          api.coingecko.com
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">CoW Protocol:</span>{' '}
                        <span className="text-gray-700 font-mono" title={API_CONFIG.cowProtocol.baseUrl}>
                          api.cow.fi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Query Versions */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <Info size={14} className="mr-1" />
                      Dune Query IDs
                    </h4>
                    <div className="space-y-1.5">
                      {Object.entries(API_CONFIG.dune.queries).map(([name, id]) => (
                        <div key={name} className="text-xs">
                          <span className="text-gray-500 capitalize">{name}:</span>{' '}
                          <span className="text-gray-700 font-mono">{id}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                      <Info size={14} className="mr-1" />
                      Resources
                    </h4>
                    <div className="space-y-1.5">
                      <a
                        href="https://snapshot.org/#/cow.eth"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 block"
                      >
                        Snapshot Governance
                      </a>
                      <a
                        href="https://forum.cow.fi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 block"
                      >
                        CoW Forum
                      </a>
                      <a
                        href="https://docs.cow.fi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 block"
                      >
                        Documentation
                      </a>
                      <a
                        href="https://github.com/cowprotocol/dune-queries"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 block"
                      >
                        Dune Queries Repo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </footer>

        {/* Configuration Modal */}
        <ConfigurationModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      </div>
    </TimeRangeProvider>
  );
}

export default App;
