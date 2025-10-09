/**
 * Retry utility with exponential backoff for API calls
 */
export async function retryWithBackoff(
  fn,
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on non-retryable errors
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 402 || error.response?.status === 404) {
        throw error; // 401=Unauthorized, 403=Forbidden, 402=Payment Required, 404=Not Found
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${Math.round(totalDelay)}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

/**
 * Enhanced axios wrapper with retry logic for rate limits
 */
export async function axiosWithRetry(config, maxRetries = 3) {
  const axios = (await import('axios')).default;

  return retryWithBackoff(
    () => axios(config),
    maxRetries,
    1000,
    10000
  );
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error) {
  return error.response?.status === 429 || error.message?.includes('429');
}

/**
 * Check if an error is a server error (5xx)
 */
export function isServerError(error) {
  const status = error.response?.status;
  return status >= 500 && status < 600;
}
