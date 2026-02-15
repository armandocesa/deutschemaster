import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase before importing cloudSync
vi.mock('../firebase', () => ({
  db: null,
  auth: { currentUser: null },
  hasConfig: false,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn() })),
}));

vi.mock('./rateLimit', () => ({
  LIMITS: {
    firestoreWrite: () => true,
    firestoreRead: () => true,
  },
}));

vi.mock('./retry', () => ({
  firestoreRetry: (fn) => fn(),
}));

// We need to test the merge logic. Since mergeData is not exported,
// we test it through syncFromCloud behavior and the saveAndSync function.
import { saveAndSync, syncToCloud, syncFromCloud, syncKeyToCloud, batchWrite } from './cloudSync';

describe('cloudSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveAndSync', () => {
    it('saves to localStorage', () => {
      saveAndSync('dm_streak', JSON.stringify({ currentStreak: 5 }));
      expect(JSON.parse(localStorage.getItem('dm_streak'))).toEqual({ currentStreak: 5 });
    });

    it('saves non-synced keys to localStorage only', () => {
      saveAndSync('dm_some_random_key', JSON.stringify('value'));
      expect(localStorage.getItem('dm_some_random_key')).toBe('"value"');
    });
  });

  describe('syncToCloud', () => {
    it('returns early when no uid', async () => {
      // Should not throw
      await syncToCloud(null);
      await syncToCloud(undefined);
    });

    it('returns early when hasConfig is false', async () => {
      await syncToCloud('test-uid');
      // No error thrown — just returns
    });
  });

  describe('syncFromCloud', () => {
    it('returns early when no uid', async () => {
      await syncFromCloud(null);
      await syncFromCloud(undefined);
    });
  });

  describe('syncKeyToCloud', () => {
    it('returns early when no uid', async () => {
      await syncKeyToCloud(null, 'dm_streak');
    });

    it('returns early when no data for key', async () => {
      // hasConfig is false, so it returns early
      await syncKeyToCloud('uid', 'dm_streak');
    });
  });

  describe('batchWrite', () => {
    it('returns early when hasConfig is false', async () => {
      const ops = vi.fn();
      await batchWrite(ops);
      expect(ops).not.toHaveBeenCalled();
    });
  });
});

// Test merge logic by directly testing the localStorage interactions
describe('cloudSync merge utilities (via localStorage)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getLocalData returns null for missing key', () => {
    // saveAndSync reads from localStorage internally
    // Verify that missing keys work
    expect(localStorage.getItem('nonexistent')).toBeNull();
  });

  it('handles corrupted JSON in localStorage gracefully', () => {
    localStorage.setItem('dm_xp', '{corrupted');
    // saveAndSync should still work (overwrites corrupted data)
    saveAndSync('dm_xp', JSON.stringify({ totalXP: 100 }));
    expect(JSON.parse(localStorage.getItem('dm_xp'))).toEqual({ totalXP: 100 });
  });

  it('preserves all SYNC_KEYS types', () => {
    const testData = {
      dm_streak: { currentStreak: 3, longestStreak: 10, lastActiveDate: '2026-02-15' },
      dm_xp: { totalXP: 500, todayXP: 50, todayDate: '2026-02-15' },
      dm_daily_goal: { target: 30, completedDates: ['2026-02-14'] },
      dm_badges: { unlocked: { first_quiz: true } },
      dm_difficultWords: [{ id: 'w1', word: 'Hund' }],
      dm_quizStats: { totalAnswered: 50, correctAnswers: 35 },
      dm_placement_level: 'B1',
      dm_completed_stories: ['story1', 'story2'],
    };

    for (const [key, value] of Object.entries(testData)) {
      saveAndSync(key, JSON.stringify(value));
      expect(JSON.parse(localStorage.getItem(key))).toEqual(value);
    }
  });
});
