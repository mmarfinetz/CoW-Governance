/**
 * Data Validation Framework
 * Ensures NO MOCK DATA and provides transparency for data sources
 */

/**
 * Checks if a number appears to be a round "mock" number
 * @param {number} value - The value to check
 * @returns {boolean} - True if suspicious
 */
function isRoundNumber(value) {
  if (typeof value !== 'number') return false;

  // Check for suspiciously round numbers
  const suspiciousPatterns = [
    10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000,
    1000000, 5000000, 10000000,
    1000, 5000,
    100, 500
  ];

  return suspiciousPatterns.includes(value);
}

/**
 * Checks if a string contains placeholder text
 * @param {string} value - The value to check
 * @returns {boolean} - True if suspicious
 */
function hasPlaceholderText(value) {
  if (typeof value !== 'string') return false;

  const placeholderPatterns = [
    /lorem\s+ipsum/i,
    /\bexample\b/i,
    /\btest\b/i,
    /\bmock\b/i,
    /\bplaceholder\b/i,
    /\bsample\b/i,
    /\bdummy\b/i,
    /\bfake\b/i,
    /todo/i,
    /\bfoo\b/i,
    /\bbar\b/i
  ];

  return placeholderPatterns.some(pattern => pattern.test(value));
}

/**
 * Checks if a date appears to be a default/placeholder date
 * @param {Date|string|number} value - The date value to check
 * @returns {boolean} - True if suspicious
 */
function isDefaultDate(value) {
  if (!value) return true;

  const date = new Date(value);
  if (isNaN(date.getTime())) return true;

  const year = date.getFullYear();
  const suspiciousYears = [1970, 2000, 2020];

  // Check for Unix epoch
  if (date.getTime() === 0) return true;

  // Check for suspiciously old dates
  if (year < 2015) return true;

  // Check for common default years
  if (suspiciousYears.includes(year)) {
    // If it's exactly 2020-01-01 00:00:00, that's suspicious
    if (date.getMonth() === 0 && date.getDate() === 1) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively validates data structure for suspicious patterns
 * @param {any} data - The data to validate
 * @param {string} path - Current path in the object (for logging)
 * @returns {Array<string>} - Array of warning messages
 */
function scanDataRecursive(data, path = 'root') {
  const warnings = [];

  if (data === null || data === undefined) {
    return warnings;
  }

  // Check arrays
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      warnings.push(...scanDataRecursive(item, `${path}[${index}]`));
    });
    return warnings;
  }

  // Check objects
  if (typeof data === 'object') {
    Object.keys(data).forEach(key => {
      warnings.push(...scanDataRecursive(data[key], `${path}.${key}`));
    });
    return warnings;
  }

  // Check primitive values
  if (typeof data === 'number' && isRoundNumber(data)) {
    warnings.push(`Suspicious round number at ${path}: ${data}`);
  }

  if (typeof data === 'string' && hasPlaceholderText(data)) {
    warnings.push(`Suspicious placeholder text at ${path}: "${data}"`);
  }

  // Check for date-like strings
  if (typeof data === 'string' && !isNaN(Date.parse(data))) {
    if (isDefaultDate(data)) {
      warnings.push(`Suspicious default date at ${path}: ${data}`);
    }
  }

  return warnings;
}

/**
 * Main validation function for data integrity
 * @param {any} data - The data to validate
 * @param {string} componentName - Name of the component using this data
 * @returns {{ valid: boolean, warnings: string[] }}
 */
export function validateRealData(data, componentName = 'Unknown Component') {
  const warnings = scanDataRecursive(data, componentName);

  if (warnings.length > 0) {
    console.warn(
      `%c[Data Validation] ${componentName}`,
      'color: #ff6b6b; font-weight: bold;',
      `\nFound ${warnings.length} suspicious pattern(s):`
    );
    warnings.forEach(warning => {
      console.warn(`  ⚠️ ${warning}`);
    });
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Validates that data contains expected real-time fields
 * @param {object} data - The data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = [];

  requiredFields.forEach(field => {
    if (!(field in data) || data[field] === null || data[field] === undefined) {
      missing.push(field);
    }
  });

  if (missing.length > 0) {
    console.warn(
      `%c[Data Validation] Missing Required Fields`,
      'color: #ff6b6b; font-weight: bold;',
      `\nMissing fields:`,
      missing
    );
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Validates that numeric data is within reasonable bounds
 * @param {number} value - The value to validate
 * @param {object} bounds - { min, max, label }
 * @returns {{ valid: boolean, warning: string | null }}
 */
export function validateBounds(value, { min = 0, max = Infinity, label = 'value' }) {
  if (typeof value !== 'number' || isNaN(value)) {
    const warning = `${label} is not a valid number: ${value}`;
    console.warn(`%c[Data Validation]`, 'color: #ff6b6b; font-weight: bold;', warning);
    return { valid: false, warning };
  }

  if (value < min || value > max) {
    const warning = `${label} is out of bounds: ${value} (expected ${min}-${max})`;
    console.warn(`%c[Data Validation]`, 'color: #ff6b6b; font-weight: bold;', warning);
    return { valid: false, warning };
  }

  return { valid: true, warning: null };
}

/**
 * Validates timestamp freshness
 * @param {Date|string|number} timestamp - The timestamp to check
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 1 hour)
 * @returns {{ valid: boolean, age: number, warning: string | null }}
 */
export function validateTimestampFreshness(timestamp, maxAgeMs = 3600000) {
  const date = new Date(timestamp);
  const now = new Date();
  const age = now.getTime() - date.getTime();

  if (isNaN(date.getTime())) {
    const warning = `Invalid timestamp: ${timestamp}`;
    console.warn(`%c[Data Validation]`, 'color: #ff6b6b; font-weight: bold;', warning);
    return { valid: false, age: Infinity, warning };
  }

  if (age > maxAgeMs) {
    const ageMinutes = Math.floor(age / 60000);
    const warning = `Stale data: ${ageMinutes} minutes old (max: ${maxAgeMs / 60000} minutes)`;
    console.warn(`%c[Data Validation]`, 'color: #ffa94d; font-weight: bold;', warning);
    return { valid: false, age, warning };
  }

  return { valid: true, age, warning: null };
}

/**
 * Development-only validation wrapper
 * @param {Function} validationFn - The validation function to run
 * @param {...any} args - Arguments to pass to the validation function
 */
export function devOnlyValidation(validationFn, ...args) {
  if (import.meta.env.DEV) {
    return validationFn(...args);
  }
  return { valid: true };
}

/**
 * Batch validate multiple data sources
 * @param {Array<{data: any, componentName: string}>} dataItems
 * @returns {{ allValid: boolean, results: Array }}
 */
export function validateMultipleSources(dataItems) {
  const results = dataItems.map(({ data, componentName }) => ({
    componentName,
    ...validateRealData(data, componentName)
  }));

  const allValid = results.every(r => r.valid);

  if (!allValid) {
    console.warn(
      `%c[Data Validation] Batch Validation Results`,
      'color: #ff6b6b; font-weight: bold;',
      `\n${results.filter(r => !r.valid).length} of ${results.length} sources have warnings`
    );
  }

  return {
    allValid,
    results
  };
}

export default {
  validateRealData,
  validateRequiredFields,
  validateBounds,
  validateTimestampFreshness,
  devOnlyValidation,
  validateMultipleSources
};
