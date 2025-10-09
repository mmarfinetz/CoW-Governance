import govConfig from '../config/govConfig.json';

/**
 * Query Version Service
 * Manages version tracking for Dune queries and validates configuration
 */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/cowprotocol/dune-queries';

/**
 * Fetch SQL query from CoW Protocol's dune-queries GitHub repository
 * @param {string} queryName - Name of the query (e.g., 'treasury', 'solverRewards')
 * @returns {Promise<{success: boolean, sql: string|null, error: string|null}>}
 */
export async function fetchQueryFromGitHub(queryName) {
  try {
    const { repo, branch, queriesPath } = govConfig.github;
    const url = `${GITHUB_RAW_BASE}/${branch}/${queriesPath}/${queryName}.sql`;

    console.log(`[QueryVersionService] Fetching query from GitHub: ${queryName}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[QueryVersionService] Failed to fetch ${queryName} from GitHub (${response.status})`);
      return {
        success: false,
        sql: null,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const sql = await response.text();

    // Extract version from SQL comment if present
    const versionMatch = sql.match(/--\s*Version:\s*([\d.]+)/i);
    const githubVersion = versionMatch ? versionMatch[1] : 'unknown';
    const localVersion = govConfig.queries.dune[queryName]?.version || 'unknown';

    if (githubVersion !== localVersion && githubVersion !== 'unknown') {
      console.warn(
        `[QueryVersionService] Version mismatch for ${queryName}: ` +
        `Local=${localVersion}, GitHub=${githubVersion}`
      );
    } else {
      console.log(`[QueryVersionService] ✓ ${queryName} version ${localVersion} matches GitHub`);
    }

    return {
      success: true,
      sql,
      error: null,
      localVersion,
      githubVersion
    };
  } catch (error) {
    console.error(`[QueryVersionService] Error fetching ${queryName}:`, error);
    return {
      success: false,
      sql: null,
      error: error.message
    };
  }
}

/**
 * Compare local query versions with GitHub versions
 * @returns {Promise<Object>} Comparison results for all queries
 */
export async function compareQueryVersions() {
  console.log('[QueryVersionService] Starting query version comparison...');

  const queryNames = Object.keys(govConfig.queries.dune);
  const results = {};

  for (const queryName of queryNames) {
    const githubResult = await fetchQueryFromGitHub(queryName);
    results[queryName] = {
      localVersion: govConfig.queries.dune[queryName].version,
      githubVersion: githubResult.githubVersion,
      synced: githubResult.success &&
              githubResult.localVersion === githubResult.githubVersion,
      error: githubResult.error
    };
  }

  return results;
}

/**
 * Validate configuration completeness and correctness
 * @returns {Object} Validation report
 */
export function validateConfig() {
  console.log('[QueryVersionService] Validating configuration...');

  const report = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  // Validate version format
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(govConfig.version)) {
    report.errors.push(`Invalid version format: ${govConfig.version}`);
    report.valid = false;
  } else {
    report.info.push(`✓ Configuration version: ${govConfig.version}`);
  }

  // Validate query IDs
  const duneQueries = govConfig.queries.dune;
  for (const [queryName, queryConfig] of Object.entries(duneQueries)) {
    if (!queryConfig.id) {
      report.errors.push(`Missing query ID for: ${queryName}`);
      report.valid = false;
    } else if (!/^\d+$/.test(queryConfig.id)) {
      report.errors.push(`Invalid query ID format for ${queryName}: ${queryConfig.id}`);
      report.valid = false;
    } else {
      report.info.push(`✓ Query ${queryName}: ID ${queryConfig.id}, v${queryConfig.version}`);
    }
  }

  // Validate environment variables
  const requiredEnvVars = {
    VITE_DUNE_API_KEY: 'Dune Analytics API access',
    VITE_ETHERSCAN_API_KEY: 'Etherscan holder count'
  };

  for (const [envVar, purpose] of Object.entries(requiredEnvVars)) {
    if (!import.meta.env[envVar]) {
      report.warnings.push(`Missing ${envVar} (required for: ${purpose})`);
    } else {
      report.info.push(`✓ ${envVar} configured`);
    }
  }

  // Validate optional environment variables
  if (!import.meta.env.VITE_COINGECKO_API_KEY) {
    report.info.push('ℹ VITE_COINGECKO_API_KEY not set (using free tier)');
  }

  // Validate cache durations
  for (const [key, duration] of Object.entries(govConfig.cache)) {
    if (typeof duration !== 'number' || duration < 0) {
      report.errors.push(`Invalid cache duration for ${key}: ${duration}`);
      report.valid = false;
    } else if (duration < 60000) {
      report.warnings.push(`Very short cache duration for ${key}: ${duration}ms`);
    }
  }

  // Validate governance parameters
  if (govConfig.governance.quorum <= 0) {
    report.errors.push(`Invalid quorum: ${govConfig.governance.quorum}`);
    report.valid = false;
  }

  if (!govConfig.governance.space) {
    report.errors.push('Missing governance space');
    report.valid = false;
  } else {
    report.info.push(`✓ Governance space: ${govConfig.governance.space}`);
  }

  // Validate API endpoints
  const apis = govConfig.apis;
  for (const [apiName, apiConfig] of Object.entries(apis)) {
    if (!apiConfig.baseUrl && !apiConfig.endpoint) {
      report.warnings.push(`Missing base URL for ${apiName} API`);
    }
  }

  return report;
}

/**
 * Run full configuration validation and log results
 * Should be called on app startup
 */
export function runStartupValidation() {
  console.log('\n========================================');
  console.log('🔍 CoW DAO Dashboard Configuration Check');
  console.log('========================================\n');

  const report = validateConfig();

  // Log errors
  if (report.errors.length > 0) {
    console.error('❌ ERRORS:');
    report.errors.forEach(err => console.error(`   • ${err}`));
    console.log('');
  }

  // Log warnings
  if (report.warnings.length > 0) {
    console.warn('⚠️  WARNINGS:');
    report.warnings.forEach(warn => console.warn(`   • ${warn}`));
    console.log('');
  }

  // Log info
  if (report.info.length > 0) {
    console.log('✓ CONFIGURATION:');
    report.info.forEach(info => console.log(`   ${info}`));
    console.log('');
  }

  // Summary
  if (report.valid) {
    console.log('✅ Configuration validation passed!\n');
  } else {
    console.error('❌ Configuration validation failed. Please fix errors above.\n');
  }

  console.log('========================================\n');

  return report;
}

/**
 * Get configuration version
 * @returns {string} Current configuration version
 */
export function getConfigVersion() {
  return govConfig.version;
}

/**
 * Get all query configurations
 * @returns {Object} Query configurations
 */
export function getQueryConfigs() {
  return govConfig.queries.dune;
}

/**
 * Get governance parameters
 * @returns {Object} Governance configuration
 */
export function getGovernanceConfig() {
  return govConfig.governance;
}

/**
 * Get API endpoints configuration
 * @returns {Object} API endpoints
 */
export function getAPIConfig() {
  return govConfig.apis;
}

/**
 * Export full configuration
 * @returns {Object} Complete configuration object
 */
export function exportConfiguration() {
  return {
    ...govConfig,
    exportedAt: new Date().toISOString(),
    environment: import.meta.env.MODE || 'production'
  };
}
