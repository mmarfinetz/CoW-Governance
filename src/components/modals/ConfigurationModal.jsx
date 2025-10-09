import React, { useState, useEffect } from 'react';
import { X, Download, Check, AlertCircle, Clock, Database, Settings, Globe } from 'lucide-react';
import govConfig from '../../config/govConfig.json';
import { API_CONFIG, CONFIG_VERSION } from '../../config/apiConfig';
import { getCacheStatus } from '../../services/cacheService';

export function ConfigurationModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [cacheStatus, setCacheStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Load cache status
      const status = getCacheStatus();
      setCacheStatus(status);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadConfig = () => {
    const configExport = {
      version: CONFIG_VERSION,
      exportedAt: new Date().toISOString(),
      environment: import.meta.env.MODE || 'production',
      govConfig,
      apiConfig: {
        snapshot: API_CONFIG.snapshot,
        dune: API_CONFIG.dune,
        coinGecko: API_CONFIG.coinGecko,
        etherscan: API_CONFIG.etherscan,
        cowProtocol: API_CONFIG.cowProtocol,
        safe: API_CONFIG.safe
      },
      cache: cacheStatus
    };

    const blob = new Blob([JSON.stringify(configExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cow-dao-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'queries', label: 'Queries', icon: Database },
    { id: 'endpoints', label: 'Endpoints', icon: Globe },
    { id: 'cache', label: 'Cache', icon: Clock }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Config Version</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{CONFIG_VERSION}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-900">Environment</div>
          <div className="text-2xl font-bold text-green-600 mt-1 capitalize">
            {import.meta.env.MODE || 'production'}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-900">Governance Space</div>
          <div className="text-xl font-bold text-purple-600 mt-1">{govConfig.governance.space}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm font-medium text-orange-900">Quorum</div>
          <div className="text-xl font-bold text-orange-600 mt-1">
            {govConfig.governance.quorum.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Supported Chains</h4>
        <div className="flex flex-wrap gap-2">
          {govConfig.governance.chains.map(chain => (
            <span
              key={chain}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
            >
              {chain}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Features</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(govConfig.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center">
              {enabled ? (
                <Check className="text-green-500 mr-2" size={16} />
              ) : (
                <AlertCircle className="text-gray-400 mr-2" size={16} />
              )}
              <span className="text-sm text-gray-700 capitalize">
                {feature.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQueries = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Database className="text-blue-600 mt-0.5 mr-2" size={18} />
          <div className="text-sm text-blue-900">
            <strong>Dune Analytics Queries</strong>
            <p className="text-blue-700 mt-1">
              All query IDs sourced from CoW Protocol's official dune-queries repository
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(govConfig.queries.dune).map(([queryName, queryConfig]) => (
          <div key={queryName} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-semibold text-gray-900">{queryConfig.name}</h4>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    v{queryConfig.version}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{queryConfig.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>
                    <strong>ID:</strong> {queryConfig.id}
                  </span>
                  <span>
                    <strong>Cache:</strong> {queryConfig.cacheDuration / 1000}s
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEndpoints = () => (
    <div className="space-y-3">
      {Object.entries(govConfig.apis).map(([apiName, apiConfig]) => (
        <div key={apiName} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="font-semibold text-gray-900 capitalize">{apiName}</h4>
                {apiConfig.requiresAuth && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    AUTH REQUIRED
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <div className="text-sm">
                  <span className="text-gray-500">Endpoint:</span>{' '}
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-blue-600">
                    {apiConfig.baseUrl || apiConfig.endpoint}
                  </code>
                </div>
                {apiConfig.rateLimit && (
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Rate Limit:</span> {apiConfig.rateLimit} req/min
                  </div>
                )}
                {apiConfig.cacheDuration && (
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Cache Duration:</span>{' '}
                    {apiConfig.cacheDuration / 1000}s
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCache = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
        <div className="flex items-start">
          <Clock className="text-purple-600 mt-0.5 mr-2" size={18} />
          <div className="text-sm text-purple-900">
            <strong>Cache Status</strong>
            <p className="text-purple-700 mt-1">
              In-memory cache reduces API calls and improves performance
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(govConfig.cache).map(([key, duration]) => {
          const status = cacheStatus[key] || {};
          const isCached = status.cached;
          const age = status.age || 0;
          const ageSeconds = Math.floor(age / 1000);

          return (
            <div key={key} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {isCached && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        CACHED
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Duration: {duration / 1000}s
                    {isCached && ` • Age: ${ageSeconds}s`}
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: isCached ? `${(age / duration) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'queries':
        return renderQueries();
      case 'endpoints':
        return renderEndpoints();
      case 'cache':
        return renderCache();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Dashboard configuration and API endpoints
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm font-medium"
            >
              <Download size={16} className="mr-2" />
              Download Config
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
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
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last Updated: {govConfig.lastUpdated}</span>
            <span>Config Version: {CONFIG_VERSION}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
