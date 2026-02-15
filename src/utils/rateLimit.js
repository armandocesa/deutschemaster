/**
 * Client-side rate limiting utility.
 * Prevents excessive API calls to Firestore and other services.
 */

const buckets = new Map();

/**
 * Rate limiter using token bucket algorithm.
 * @param {string} key - Unique identifier for the rate limit bucket
 * @param {number} maxTokens - Maximum number of tokens (calls allowed in window)
 * @param {number} refillMs - Time in ms to refill one token
 * @returns {boolean} true if the call is allowed, false if rate limited
 */
export function rateLimit(key, maxTokens = 10, refillMs = 1000) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: maxTokens - 1, lastRefill: now };
    buckets.set(key, bucket);
    return true;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / refillMs);
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

/**
 * Preset rate limits for common operations.
 */
export const LIMITS = {
  // Firestore reads: max 30 per 10 seconds
  firestoreRead: (key = 'firestore-read') => rateLimit(key, 30, 333),
  // Firestore writes: max 10 per 10 seconds
  firestoreWrite: (key = 'firestore-write') => rateLimit(key, 10, 1000),
  // Auth operations: max 5 per minute
  auth: (key = 'auth') => rateLimit(key, 5, 12000),
  // Analytics events: max 20 per 10 seconds
  analytics: (key = 'analytics') => rateLimit(key, 20, 500),
  // TTS/Speech: max 10 per 10 seconds
  speech: (key = 'speech') => rateLimit(key, 10, 1000),
};

/**
 * Wraps an async function with rate limiting.
 * Returns null if rate limited instead of calling the function.
 * @param {string} key - Rate limit bucket key
 * @param {Function} fn - Async function to wrap
 * @param {number} maxTokens - Max tokens
 * @param {number} refillMs - Refill interval
 * @returns {Function} Rate-limited version of the function
 */
export function withRateLimit(key, fn, maxTokens = 10, refillMs = 1000) {
  return async (...args) => {
    if (!rateLimit(key, maxTokens, refillMs)) {
      if (import.meta.env.DEV) console.warn(`Rate limited: ${key}`);
      return null;
    }
    return fn(...args);
  };
}
