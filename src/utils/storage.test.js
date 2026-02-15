import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock cloudSync before importing storage
vi.mock('./cloudSync', () => ({
  saveAndSync: vi.fn((key, value) => {
    localStorage.setItem(key, value);
  }),
}));

import {
  getDifficultWords,
  saveDifficultWord,
  removeDifficultWord,
  isDifficultWord,
  getQuizStats,
  updateQuizStats,
  getWordStatus,
} from './storage';

beforeEach(() => {
  localStorage.clear();
});

describe('getDifficultWords', () => {
  it('returns empty array when no data', () => {
    expect(getDifficultWords()).toEqual([]);
  });

  it('returns saved words', () => {
    localStorage.setItem('dm_difficultWords', JSON.stringify([{ id: 'Hund', german: 'Hund', type: 'word' }]));
    expect(getDifficultWords()).toHaveLength(1);
    expect(getDifficultWords()[0].id).toBe('Hund');
  });
});

describe('saveDifficultWord', () => {
  it('saves a word', () => {
    saveDifficultWord({ german: 'Katze', italian: 'gatto' }, 'word');
    const words = getDifficultWords();
    expect(words).toHaveLength(1);
    expect(words[0].id).toBe('Katze');
    expect(words[0].type).toBe('word');
  });

  it('does not duplicate words', () => {
    saveDifficultWord({ german: 'Hund', italian: 'cane' }, 'word');
    saveDifficultWord({ german: 'Hund', italian: 'cane' }, 'word');
    expect(getDifficultWords()).toHaveLength(1);
  });

  it('saves a verb with infinitiv as id', () => {
    saveDifficultWord({ infinitiv: 'gehen', italiano: 'andare' }, 'verb');
    const words = getDifficultWords();
    expect(words[0].id).toBe('gehen');
    expect(words[0].type).toBe('verb');
  });
});

describe('removeDifficultWord', () => {
  it('removes a word by id', () => {
    saveDifficultWord({ german: 'Katze', italian: 'gatto' }, 'word');
    saveDifficultWord({ german: 'Hund', italian: 'cane' }, 'word');
    removeDifficultWord('Katze');
    expect(getDifficultWords()).toHaveLength(1);
    expect(getDifficultWords()[0].id).toBe('Hund');
  });
});

describe('isDifficultWord', () => {
  it('returns true for saved words', () => {
    saveDifficultWord({ german: 'Haus', italian: 'casa' }, 'word');
    expect(isDifficultWord('Haus')).toBe(true);
  });

  it('returns false for unsaved words', () => {
    expect(isDifficultWord('Haus')).toBe(false);
  });
});

describe('getQuizStats', () => {
  it('returns default stats when empty', () => {
    const stats = getQuizStats();
    expect(stats.totalAnswered).toBe(0);
    expect(stats.correctAnswers).toBe(0);
  });
});

describe('updateQuizStats', () => {
  it('increments total and correct on correct answer', () => {
    updateQuizStats(true);
    const stats = getQuizStats();
    expect(stats.totalAnswered).toBe(1);
    expect(stats.correctAnswers).toBe(1);
  });

  it('increments only total on wrong answer', () => {
    updateQuizStats(false);
    const stats = getQuizStats();
    expect(stats.totalAnswered).toBe(1);
    expect(stats.correctAnswers).toBe(0);
  });

  it('accumulates over multiple calls', () => {
    updateQuizStats(true);
    updateQuizStats(true);
    updateQuizStats(false);
    const stats = getQuizStats();
    expect(stats.totalAnswered).toBe(3);
    expect(stats.correctAnswers).toBe(2);
  });
});
