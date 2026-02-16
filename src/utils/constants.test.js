import { describe, it, expect } from 'vitest';
import { LEVEL_COLORS, GOETHE_NAMES, getLevelName, fisherYatesShuffle } from './constants';

describe('LEVEL_COLORS', () => {
  it('has all 6 levels', () => {
    expect(Object.keys(LEVEL_COLORS)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('each level has bg, light, and text colors', () => {
    for (const level of Object.values(LEVEL_COLORS)) {
      expect(level).toHaveProperty('bg');
      expect(level).toHaveProperty('light');
      expect(level).toHaveProperty('text');
      expect(level.bg).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe('GOETHE_NAMES', () => {
  it('has all 6 levels', () => {
    expect(Object.keys(GOETHE_NAMES)).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });

  it('all values contain "Goethe-Zertifikat"', () => {
    for (const name of Object.values(GOETHE_NAMES)) {
      expect(name).toContain('Goethe-Zertifikat');
    }
  });
});

describe('getLevelName', () => {
  it('returns correct Italian names for known levels', () => {
    expect(getLevelName('A1', 'it')).toBe('Principiante');
    expect(getLevelName('B1', 'it')).toBe('Intermedio');
    expect(getLevelName('C2', 'it')).toBe('Padronanza');
  });

  it('returns correct English names for known levels', () => {
    expect(getLevelName('A1', 'en')).toBe('Beginner');
    expect(getLevelName('B1', 'en')).toBe('Intermediate');
    expect(getLevelName('C2', 'en')).toBe('Mastery');
  });

  it('returns correct German names for known levels', () => {
    expect(getLevelName('A1', 'de')).toBe('Anfänger');
    expect(getLevelName('B1', 'de')).toBe('Mittelstufe');
    expect(getLevelName('C2', 'de')).toBe('Beherrschung');
  });

  it('returns the level itself for unknown levels', () => {
    expect(getLevelName('X1', 'en')).toBe('X1');
    expect(getLevelName('', 'en')).toBe('');
  });
});

describe('fisherYatesShuffle', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(fisherYatesShuffle(arr)).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = fisherYatesShuffle(arr);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not modify the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    fisherYatesShuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });

  it('produces different orderings (statistical test)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set();
    for (let i = 0; i < 20; i++) {
      results.add(JSON.stringify(fisherYatesShuffle(arr)));
    }
    // With 10 elements, 20 shuffles should produce at least 2 unique orderings
    expect(results.size).toBeGreaterThan(1);
  });
});
