/**
 * Retry utility with exponential backoff.
 * Wraps async functions to automatically retry on failure.
 */

/**
 * Retry an async function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {object} options - Configuration
 * @param {number} options.maxRetries - Max number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Max delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Predicate to determine if error is retryable
 * @returns {Promise<*>} Result of the function
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = isRetryableError,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 500,
        maxDelay
      );

      if (import.meta.env.DEV) {
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms:`, error.message);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Determine if a Firebase/network error is retryable.
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryableError(error) {
  // Network errors
  if (!navigator.onLine) return true;
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) return true;

  // Firebase error codes that are retryable
  const retryableCodes = [
    'unavailable',          // Firestore temporarily unavailable
    'deadline-exceeded',    // Request took too long
    'resource-exhausted',   // Rate limited
    'aborted',              // Transaction aborted
    'internal',             // Internal server error
    'cancelled',            // Operation cancelled
  ];

  if (error.code && retryableCodes.includes(error.code)) return true;

  // HTTP status codes
  if (error.status === 429 || error.status === 503 || error.status === 502) return true;

  return false;
}

/**
 * Wraps a Firestore operation with retry logic.
 * Convenience wrapper with Firestore-specific defaults.
 * @param {Function} fn - Async Firestore function
 * @returns {Promise<*>}
 */
export function firestoreRetry(fn) {
  return withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
  });
}
