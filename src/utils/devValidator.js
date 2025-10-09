/**
 * Development Mode Validator
 * Scans the DOM for data-source attributes and validates data integrity
 * Only runs in development mode
 */

import { validateRealData } from './dataValidator';

/**
 * Scan all rendered components for data-source attributes
 * @returns {Array<{element: Element, source: string}>}
 */
function scanDataSourceAttributes() {
  const elementsWithSource = [];
  const allElements = document.querySelectorAll('[data-source]');

  allElements.forEach(element => {
    const source = element.getAttribute('data-source');
    if (source) {
      elementsWithSource.push({
        element,
        source,
        tag: element.tagName.toLowerCase(),
        classes: element.className
      });
    }
  });

  return elementsWithSource;
}

/**
 * Find components that should have data-source but don't
 * @returns {Array<{element: Element, component: string}>}
 */
function findMissingAttributions() {
  const missing = [];

  // Target elements that likely display data but lack attribution
  const candidateSelectors = [
    // Metric cards (common patterns)
    '[class*="metric"]',
    '[class*="card"]',
    '[class*="stat"]',
    // Chart containers
    '[class*="chart"]',
    '[class*="recharts"]',
    // Data tables
    'table',
    '[class*="table"]',
    // Value displays
    '[class*="value"]',
    '[class*="amount"]',
    '[class*="count"]'
  ];

  candidateSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Skip if already has data-source
      if (element.hasAttribute('data-source')) return;

      // Skip if parent has data-source (inherited attribution)
      if (element.closest('[data-source]')) return;

      // Skip if it's just a container without actual data
      const hasNumberContent = /\d/.test(element.textContent || '');
      if (!hasNumberContent) return;

      missing.push({
        element,
        component: element.className || element.tagName,
        textContent: (element.textContent || '').substring(0, 50)
      });
    });
  });

  return missing;
}

/**
 * Generate attribution coverage report
 * @returns {object} Coverage statistics
 */
function generateCoverageReport() {
  const attributed = scanDataSourceAttributes();
  const missing = findMissingAttributions();

  const total = attributed.length + missing.length;
  const coverage = total > 0 ? (attributed.length / total) * 100 : 100;

  return {
    attributed: attributed.length,
    missing: missing.length,
    total,
    coverage: coverage.toFixed(1),
    attributedElements: attributed,
    missingElements: missing
  };
}

/**
 * Log validation warnings to console
 * @param {object} report - Coverage report
 */
function logValidationReport(report) {
  console.group(
    `%c[Dev Validator] Data Source Attribution Report`,
    'color: #4dabf7; font-weight: bold; font-size: 14px;'
  );

  console.log(
    `%c✓ Coverage: ${report.coverage}%`,
    `color: ${report.coverage >= 80 ? '#51cf66' : '#ff6b6b'}; font-weight: bold;`
  );
  console.log(`  Attributed: ${report.attributed}`);
  console.log(`  Missing: ${report.missing}`);
  console.log(`  Total: ${report.total}`);

  if (report.missing > 0) {
    console.group(
      `%c⚠️ ${report.missing} component(s) missing data-source attribution`,
      'color: #ffa94d; font-weight: bold;'
    );

    report.missingElements.slice(0, 10).forEach(({ component, textContent }) => {
      console.log(
        `%c  • ${component}`,
        'color: #868e96;',
        `\n    Content: "${textContent}..."`
      );
    });

    if (report.missingElements.length > 10) {
      console.log(`  ... and ${report.missingElements.length - 10} more`);
    }

    console.groupEnd();
  }

  if (report.attributedElements.length > 0) {
    console.group(`✓ ${report.attributed} attributed elements`);

    const sourceBreakdown = {};
    report.attributedElements.forEach(({ source }) => {
      const baseSrc = source.split(':')[0];
      sourceBreakdown[baseSrc] = (sourceBreakdown[baseSrc] || 0) + 1;
    });

    Object.entries(sourceBreakdown)
      .sort(([, a], [, b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
      });

    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Validate data displayed in attributed components
 * This is a passive check - it doesn't have access to the actual data,
 * just the DOM elements
 */
function validateDisplayedData() {
  const attributed = scanDataSourceAttributes();
  const warnings = [];

  attributed.forEach(({ element, source }) => {
    const textContent = element.textContent || '';

    // Check for suspicious patterns in displayed text
    const suspiciousPatterns = [
      { pattern: /\b(lorem|ipsum)\b/i, warning: 'placeholder text' },
      { pattern: /\b(test|example|mock|dummy)\b/i, warning: 'test data' },
      { pattern: /\b(undefined|null|NaN)\b/i, warning: 'undefined values' },
      { pattern: /\b999+\b/, warning: 'suspicious round number' }
    ];

    suspiciousPatterns.forEach(({ pattern, warning }) => {
      if (pattern.test(textContent)) {
        warnings.push({
          source,
          element,
          warning,
          content: textContent.substring(0, 100)
        });
      }
    });
  });

  if (warnings.length > 0) {
    console.group(
      `%c[Dev Validator] ⚠️ Found ${warnings.length} data warning(s)`,
      'color: #ff6b6b; font-weight: bold;'
    );

    warnings.forEach(({ source, warning, content }) => {
      console.warn(`  ${source}: ${warning}\n    "${content}..."`);
    });

    console.groupEnd();
  }

  return warnings;
}

/**
 * Main validation runner
 * Executes all validation checks and logs results
 */
export function runDevValidation() {
  if (!import.meta.env.DEV) {
    return; // Only run in development
  }

  console.log(
    `%c[Dev Validator] Running data validation checks...`,
    'color: #4dabf7; font-weight: bold;'
  );

  const report = generateCoverageReport();
  logValidationReport(report);

  const dataWarnings = validateDisplayedData();

  // Return summary
  return {
    coverage: report,
    dataWarnings,
    passed: report.coverage >= 80 && dataWarnings.length === 0
  };
}

/**
 * Auto-run validation on initial load and after major updates
 * Debounced to avoid excessive checks
 */
let validationTimeout = null;

export function scheduleValidation(delay = 1000) {
  if (!import.meta.env.DEV) return;

  if (validationTimeout) {
    clearTimeout(validationTimeout);
  }

  validationTimeout = setTimeout(() => {
    runDevValidation();
  }, delay);
}

/**
 * Initialize dev validator with MutationObserver
 * Automatically validates when DOM changes
 */
export function initDevValidator() {
  if (!import.meta.env.DEV) return;

  console.log(
    `%c[Dev Validator] Initialized - monitoring DOM for data source attributions`,
    'color: #4dabf7; font-style: italic;'
  );

  // Run initial validation after a short delay
  scheduleValidation(2000);

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    scheduleValidation(1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-source']
  });

  // Expose validation function to window for manual testing
  if (typeof window !== 'undefined') {
    window.__runDataValidation = runDevValidation;
    window.__validateData = validateRealData;
    console.log(
      `%cDev Tools Available:`,
      'color: #4dabf7; font-weight: bold;',
      '\n  • window.__runDataValidation() - Run validation checks',
      '\n  • window.__validateData(data, component) - Validate data object'
    );
  }

  return observer;
}

/**
 * Helper to assert data source exists on component mount
 * For use in React components during development
 */
export function assertDataSource(ref, expectedSource) {
  if (!import.meta.env.DEV) return;

  if (ref.current && !ref.current.hasAttribute('data-source')) {
    console.warn(
      `%c[Dev Validator] Missing data-source attribute`,
      'color: #ff6b6b; font-weight: bold;',
      `\nExpected: ${expectedSource}`,
      ref.current
    );
  }
}

export default {
  runDevValidation,
  scheduleValidation,
  initDevValidator,
  scanDataSourceAttributes,
  findMissingAttributions,
  generateCoverageReport,
  assertDataSource
};
