import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadVocabStats, loadVocabIndex, loadVocabModules } from './dataLoader';

describe('dataLoader', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('loadVocabStats fetches stats.json', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ total: 14315 }) }));
    const result = await loadVocabStats();
    expect(result).toEqual({ total: 14315 });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('vocabulary/stats.json'));
  });

  it('loadVocabIndex fetches level index', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([{ name: 'Animals' }]) }));
    const result = await loadVocabIndex('A1');
    expect(result).toEqual([{ name: 'Animals' }]);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('vocabulary/a1/index.json'));
  });

  it('loadVocabModules fetches module chunk', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([{ words: [] }]) }));
    const result = await loadVocabModules('A1', 1);
    expect(result).toEqual([{ words: [] }]);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('vocabulary/a1/modules_1.json'));
  });

  it('returns null on fetch error', async () => {
    // Use unique path to avoid cache
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    const result = await loadVocabModules('C2', 99);
    expect(result).toBeNull();
  });

  it('returns null on HTTP error', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404 }));
    const result = await loadVocabModules('C2', 98);
    expect(result).toBeNull();
  });

  it('caches results', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ cached: true }) }));
    await loadVocabIndex('B1');
    await loadVocabIndex('B1');
    // Second call should use cache, so fetch only called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
