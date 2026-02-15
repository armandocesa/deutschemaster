import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, LIMITS, withRateLimit } from './rateLimit';

describe('rateLimit', () => {
  it('allows calls within the limit', () => {
    expect(rateLimit('test-allow', 5, 1000)).toBe(true);
    expect(rateLimit('test-allow', 5, 1000)).toBe(true);
    expect(rateLimit('test-allow', 5, 1000)).toBe(true);
  });

  it('blocks calls that exceed the limit', () => {
    const key = 'test-block-' + Date.now();
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 100000); // very slow refill
    }
    expect(rateLimit(key, 3, 100000)).toBe(false);
  });

  it('refills tokens over time', async () => {
    const key = 'test-refill-' + Date.now();
    // Use all tokens
    for (let i = 0; i < 2; i++) {
      rateLimit(key, 2, 50);
    }
    expect(rateLimit(key, 2, 50)).toBe(false);
    // Wait for refill
    await new Promise(r => setTimeout(r, 60));
    expect(rateLimit(key, 2, 50)).toBe(true);
  });
});

describe('LIMITS presets', () => {
  it('firestoreRead allows reasonable calls', () => {
    expect(LIMITS.firestoreRead('test-fr')).toBe(true);
  });

  it('firestoreWrite allows reasonable calls', () => {
    expect(LIMITS.firestoreWrite('test-fw')).toBe(true);
  });

  it('analytics allows reasonable calls', () => {
    expect(LIMITS.analytics('test-analytics')).toBe(true);
  });
});

describe('withRateLimit', () => {
  it('calls the function when within limit', async () => {
    const fn = withRateLimit('test-wrap-' + Date.now(), async () => 42, 5, 1000);
    const result = await fn();
    expect(result).toBe(42);
  });

  it('returns null when rate limited', async () => {
    const key = 'test-wrap-block-' + Date.now();
    const fn = withRateLimit(key, async () => 42, 1, 100000);
    await fn(); // uses the one token
    const result = await fn(); // should be blocked
    expect(result).toBe(null);
  });
});
