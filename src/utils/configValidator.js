import govConfig from '../config/govConfig.json';
import { API_CONFIG, CACHE_DURATIONS } from '../config/apiConfig.js';

/**
 * Configuration Validator
 * Validates all application configuration on startup
 */

/**
 * Validate environment variables
 * @returns {Object} Validation results
 */
function validateEnvironmentVariables() {
  const results = {
    valid: true,
    required: [],
    optional: [],
    missing: []
  };

  // Required API keys
  const requiredKeys = [
    {
      key: 'VITE_DUNE_API_KEY',
      description: 'Dune Analytics (treasury & solver data)'
    },
    {
      key: 'VITE_ETHERSCAN_API_KEY',
      description: 'Etherscan (token holder count)'
    }
  ];

  // Optional API keys
  const optionalKeys = [
    {
      key: 'VITE_COINGECKO_API_KEY',
      description: 'CoinGecko (higher rate limits)'
    },
    {
      key: 'VITE_SNAPSHOT_API',
      description: 'Custom Snapshot endpoint'
    },
    {
      key: 'VITE_COW_API_BASE',
      description: 'Custom CoW Protocol API endpoint'
    },
    {
      key: 'VITE_SAFE_API_BASE',
      description: 'Custom Safe Transaction Service endpoint'
    }
  ];

  // Check required keys
  for (const { key, description } of requiredKeys) {
    if (import.meta.env[key]) {
      results.required.push({ key, description, present: true });
    } else {
      results.required.push({ key, description, present: false });
      results.missing.push(key);
      results.valid = false;
    }
  }

  // Check optional keys
  for (const { key, description } of optionalKeys) {
    results.optional.push({
      key,
      description,
      present: !!import.meta.env[key]
    });
  }

  return results;
}

/**
 * Validate query IDs format
 * @returns {Object} Validation results
 */
function validateQueryIDs() {
  const results = {
    valid: true,
    queries: []
  };

  const duneQueries = govConfig.queries.dune;

  for (const [queryName, queryConfig] of Object.entries(duneQueries)) {
    const queryResult = {
      name: queryName,
      id: queryConfig.id,
      version: queryConfig.version,
      valid: true,
      issues: []
    };

    // Validate ID format (should be numeric string)
    if (!queryConfig.id) {
      queryResult.valid = false;
      queryResult.issues.push('Missing query ID');
      results.valid = false;
    } else if (!/^\d+$/.test(queryConfig.id)) {
      queryResult.valid = false;
      queryResult.issues.push(`Invalid ID format: ${queryConfig.id}`);
      results.valid = false;
    }

    // Validate version format
    if (!queryConfig.version) {
      queryResult.valid = false;
      queryResult.issues.push('Missing version');
      results.valid = false;
    } else if (!/^\d+\.\d+$/.test(queryConfig.version)) {
      queryResult.issues.push(`Non-standard version format: ${queryConfig.version}`);
    }

    // Check if ID matches API_CONFIG
    const apiConfigId = API_CONFIG.dune.queries[queryName];
    if (apiConfigId && apiConfigId !== queryConfig.id) {
      queryResult.issues.push(`ID mismatch with apiConfig.js: ${apiConfigId}`);
    }

    results.queries.push(queryResult);
  }

  return results;
}

/**
 * Validate cache durations
 * @returns {Object} Validation results
 */
function validateCacheDurations() {
  const results = {
    valid: true,
    durations: [],
    warnings: []
  };

  // Check govConfig cache durations
  for (const [key, duration] of Object.entries(govConfig.cache)) {
    const durationResult = {
      key,
      duration,
      durationSeconds: duration / 1000,
      valid: true,
      issues: []
    };

    if (typeof duration !== 'number') {
      durationResult.valid = false;
      durationResult.issues.push('Duration must be a number');
      results.valid = false;
    } else if (duration < 0) {
      durationResult.valid = false;
      durationResult.issues.push('Duration cannot be negative');
      results.valid = false;
    } else if (duration < 30000) {
      durationResult.issues.push('Very short cache duration (<30s)');
      results.warnings.push(`${key}: ${duration}ms is very short`);
    } else if (duration > 3600000) {
      durationResult.issues.push('Very long cache duration (>1h)');
    }

    results.durations.push(durationResult);
  }

  // Check CACHE_DURATIONS consistency
  for (const [key, duration] of Object.entries(CACHE_DURATIONS)) {
    if (!govConfig.cache[key]) {
      results.warnings.push(`${key} in CACHE_DURATIONS but not in govConfig`);
    } else if (govConfig.cache[key] !== duration) {
      results.warnings.push(
        `${key} duration mismatch: ` +
        `govConfig=${govConfig.cache[key]}ms, ` +
        `CACHE_DURATIONS=${duration}ms`
      );
    }
  }

  return results;
}

/**
 * Validate API endpoints
 * @returns {Object} Validation results
 */
function validateAPIEndpoints() {
  const results = {
    valid: true,
    endpoints: []
  };

  for (const [apiName, apiConfig] of Object.entries(govConfig.apis)) {
    const endpointResult = {
      name: apiName,
      url: apiConfig.baseUrl || apiConfig.endpoint,
      requiresAuth: apiConfig.requiresAuth || false,
      valid: true,
      issues: []
    };

    // Check URL format
    const url = apiConfig.baseUrl || apiConfig.endpoint;
    if (!url) {
      endpointResult.valid = false;
      endpointResult.issues.push('Missing endpoint URL');
      results.valid = false;
    } else {
      try {
        new URL(url);
      } catch (error) {
        endpointResult.valid = false;
        endpointResult.issues.push('Invalid URL format');
        results.valid = false;
      }
    }

    // Check rate limit
    if (apiConfig.rateLimit && typeof apiConfig.rateLimit !== 'number') {
      endpointResult.issues.push('Rate limit must be a number');
    }

    results.endpoints.push(endpointResult);
  }

  return results;
}

/**
 * Validate governance configuration
 * @returns {Object} Validation results
 */
function validateGovernanceConfig() {
  const results = {
    valid: true,
    issues: []
  };

  const { governance } = govConfig;

  // Validate space
  if (!governance.space) {
    results.valid = false;
    results.issues.push('Missing governance space');
  }

  // Validate quorum
  if (!governance.quorum || governance.quorum <= 0) {
    results.valid = false;
    results.issues.push(`Invalid quorum: ${governance.quorum}`);
  }

  // Validate chains
  if (!Array.isArray(governance.chains) || governance.chains.length === 0) {
    results.valid = false;
    results.issues.push('Missing or invalid chains array');
  }

  // Validate proposal types
  if (!Array.isArray(governance.supportedProposalTypes)) {
    results.issues.push('Missing supported proposal types');
  }

  return results;
}

/**
 * Validate complete application configuration
 * @returns {Object} Complete validation report
 */
export function validateAppConfig() {
  const report = {
    timestamp: new Date().toISOString(),
    configVersion: govConfig.version,
    environment: import.meta.env.MODE || 'production',
    valid: true,
    environment: {},
    queries: {},
    cache: {},
    endpoints: {},
    governance: {}
  };

  // Run all validations
  report.environment = validateEnvironmentVariables();
  report.queries = validateQueryIDs();
  report.cache = validateCacheDurations();
  report.endpoints = validateAPIEndpoints();
  report.governance = validateGovernanceConfig();

  // Overall validity
  report.valid =
    report.environment.valid &&
    report.queries.valid &&
    report.cache.valid &&
    report.endpoints.valid &&
    report.governance.valid;

  return report;
}

/**
 * Log validation report to console
 * @param {Object} report - Validation report from validateAppConfig()
 */
export function logValidationReport(report) {
  console.log('\n========================================');
  console.log('🔍 Configuration Validation Report');
  console.log('========================================\n');

  console.log(`Config Version: ${report.configVersion}`);
  console.log(`Environment: ${report.environment}`);
  console.log(`Timestamp: ${report.timestamp}\n`);

  // Environment Variables
  console.log('📦 Environment Variables:');
  console.log('   Required:');
  report.environment.required.forEach(({ key, description, present }) => {
    const status = present ? '✓' : '✗';
    console.log(`     ${status} ${key} - ${description}`);
  });

  console.log('   Optional:');
  report.environment.optional.forEach(({ key, description, present }) => {
    const status = present ? '✓' : 'ℹ';
    console.log(`     ${status} ${key} - ${description}`);
  });
  console.log('');

  // Query IDs
  console.log('🔢 Dune Query IDs:');
  report.queries.queries.forEach(query => {
    const status = query.valid ? '✓' : '✗';
    console.log(`   ${status} ${query.name}: ID ${query.id} (v${query.version})`);
    if (query.issues.length > 0) {
      query.issues.forEach(issue => console.log(`      ⚠ ${issue}`));
    }
  });
  console.log('');

  // Cache Durations
  console.log('⏱  Cache Durations:');
  report.cache.durations.forEach(cache => {
    const status = cache.valid ? '✓' : '✗';
    console.log(`   ${status} ${cache.key}: ${cache.durationSeconds}s`);
    if (cache.issues.length > 0) {
      cache.issues.forEach(issue => console.log(`      ℹ ${issue}`));
    }
  });
  if (report.cache.warnings.length > 0) {
    console.log('   Warnings:');
    report.cache.warnings.forEach(warn => console.log(`      ⚠ ${warn}`));
  }
  console.log('');

  // API Endpoints
  console.log('🌐 API Endpoints:');
  report.endpoints.endpoints.forEach(endpoint => {
    const status = endpoint.valid ? '✓' : '✗';
    const auth = endpoint.requiresAuth ? ' [AUTH REQUIRED]' : '';
    console.log(`   ${status} ${endpoint.name}: ${endpoint.url}${auth}`);
    if (endpoint.issues.length > 0) {
      endpoint.issues.forEach(issue => console.log(`      ✗ ${issue}`));
    }
  });
  console.log('');

  // Governance
  console.log('🏛  Governance Configuration:');
  if (report.governance.valid) {
    console.log(`   ✓ Space: ${govConfig.governance.space}`);
    console.log(`   ✓ Quorum: ${govConfig.governance.quorum.toLocaleString()}`);
    console.log(`   ✓ Chains: ${govConfig.governance.chains.join(', ')}`);
  } else {
    report.governance.issues.forEach(issue => console.log(`   ✗ ${issue}`));
  }
  console.log('');

  // Overall Status
  if (report.valid) {
    console.log('✅ All configuration checks passed!\n');
  } else {
    console.error('❌ Configuration validation failed. Please fix errors above.\n');
  }

  console.log('========================================\n');
}

/**
 * Run validation on app startup and log results
 * @returns {Object} Validation report
 */
export function runStartupValidation() {
  const report = validateAppConfig();
  logValidationReport(report);
  return report;
}

/**
 * Get configuration summary for display
 * @returns {Object} Configuration summary
 */
export function getConfigSummary() {
  return {
    version: govConfig.version,
    environment: import.meta.env.MODE || 'production',
    queryCount: Object.keys(govConfig.queries.dune).length,
    apiCount: Object.keys(govConfig.apis).length,
    governanceSpace: govConfig.governance.space,
    quorum: govConfig.governance.quorum,
    lastUpdated: govConfig.lastUpdated
  };
}
