import React, { useState } from 'react';
import { Shield, BarChart3, DollarSign, Network, Swords, AlertTriangle, GitCompare } from 'lucide-react';
import { GovernanceOverview } from './components/sections/GovernanceOverview';
import { ProposalAnalytics } from './components/sections/ProposalAnalytics';
import { TreasuryDashboard } from './components/sections/TreasuryDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'proposals', label: 'Proposals', icon: BarChart3 },
    { id: 'treasury', label: 'Treasury', icon: DollarSign },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <GovernanceOverview />;
      case 'proposals':
        return <ProposalAnalytics />;
      case 'treasury':
        return <TreasuryDashboard />;
      default:
        return <GovernanceOverview />;
    }
  };

  return (
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>CoW DAO Governance Dashboard</p>
              <p className="text-xs mt-1">All data fetched in real-time from public APIs</p>
            </div>
            <div className="flex space-x-6">
              <a
                href="https://snapshot.org/#/cow.eth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Snapshot
              </a>
              <a
                href="https://forum.cow.fi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forum
              </a>
              <a
                href="https://docs.cow.fi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
