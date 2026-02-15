import { describe, it, expect, vi } from 'vitest';
import { withRetry, firestoreRetry } from './retry';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('fail'), { code: 'unavailable' }))
      .mockResolvedValueOnce('ok');
    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(
      withRetry(fn, { maxRetries: 2, baseDelay: 10, shouldRetry: () => true })
    ).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('does not retry non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('permanent'));
    await expect(
      withRetry(fn, { maxRetries: 3, baseDelay: 10, shouldRetry: () => false })
    ).rejects.toThrow('permanent');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('respects custom shouldRetry predicate', async () => {
    const retryableError = Object.assign(new Error('temp'), { code: 'unavailable' });
    const permanentError = new Error('perm');

    const fn = vi.fn()
      .mockRejectedValueOnce(retryableError)
      .mockRejectedValueOnce(permanentError);

    const shouldRetry = (err) => err.code === 'unavailable';

    await expect(
      withRetry(fn, { maxRetries: 3, baseDelay: 10, shouldRetry })
    ).rejects.toThrow('perm');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('firestoreRetry', () => {
  it('works as a convenience wrapper', async () => {
    const result = await firestoreRetry(() => Promise.resolve('data'));
    expect(result).toBe('data');
  });
});
