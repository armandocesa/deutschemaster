import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock cloudSync
vi.mock('./cloudSync', () => ({
  saveAndSync: vi.fn((key, value) => {
    localStorage.setItem(key, value);
  }),
}));

import {
  getStreak,
  recordActivity,
  getStreakCalendar,
  getXP,
  addXP,
  getLevel,
  getDailyGoal,
  setDailyGoal,
  checkDailyGoal,
  getBadges,
  checkBadges,
  addToReview,
  getReviewWords,
  recordReview,
  getReviewStats,
} from './gamification';

beforeEach(() => {
  localStorage.clear();
});

// ============================================================================
// STREAK SYSTEM
// ============================================================================
describe('Streak System', () => {
  it('getStreak returns default data when empty', () => {
    const streak = getStreak();
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(0);
    expect(streak.lastActiveDate).toBe(null);
    expect(streak.calendar).toEqual({});
  });

  it('recordActivity starts a streak on first use', () => {
    const result = recordActivity();
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActiveDate).toBeTruthy();
  });

  it('recordActivity does not increment on same day', () => {
    recordActivity();
    const result = recordActivity();
    expect(result.currentStreak).toBe(1);
  });

  it('getStreakCalendar returns days for a month', () => {
    const calendar = getStreakCalendar(2026, 1);
    expect(calendar).toHaveLength(31); // January
    expect(calendar[0].day).toBe(1);
    expect(calendar[30].day).toBe(31);
  });
});

// ============================================================================
// XP SYSTEM
// ============================================================================
describe('XP System', () => {
  it('getXP returns default data when empty', () => {
    const xp = getXP();
    expect(xp.totalXP).toBe(0);
    expect(xp.level).toBe(1);
    expect(xp.todayXP).toBe(0);
  });

  it('addXP increases total and today XP', () => {
    const result = addXP(50, 'quiz_complete');
    expect(result.totalXP).toBe(50);
    expect(result.xpAdded).toBe(50);
    expect(result.source).toBe('quiz_complete');
  });

  it('addXP accumulates over multiple calls', () => {
    addXP(10, 'quiz_correct');
    addXP(15, 'writing_correct');
    const xp = getXP();
    expect(xp.totalXP).toBe(25);
    expect(xp.todayXP).toBe(25);
  });

  it('addXP with streak_bonus calculates based on multiplier', () => {
    const result = addXP(0, 'streak_bonus', 5);
    expect(result.totalXP).toBe(25); // 5 * 5
  });
});

describe('getLevel', () => {
  it('level 1 at 0 XP', () => {
    const level = getLevel(0);
    expect(level.level).toBe(1);
    expect(level.xpForNext).toBe(100);
    expect(level.xpInCurrent).toBe(0);
  });

  it('level 1 at 99 XP', () => {
    const level = getLevel(99);
    expect(level.level).toBe(1);
    expect(level.xpInCurrent).toBe(99);
  });

  it('level 1 at 100 XP (just reached level 1)', () => {
    const level = getLevel(100);
    expect(level.level).toBe(1);
    expect(level.xpForNext).toBe(200);
  });

  it('level 2 at 300 XP (100 + 200)', () => {
    const level = getLevel(300);
    expect(level.level).toBe(2);
  });

  it('higher levels require progressively more XP', () => {
    const l5 = getLevel(1500); // 100+200+300+400+500 = 1500
    expect(l5.level).toBe(5);
  });
});

// ============================================================================
// DAILY GOALS
// ============================================================================
describe('Daily Goals', () => {
  it('getDailyGoal returns default target of 50', () => {
    const goal = getDailyGoal();
    expect(goal.target).toBe(50);
    expect(goal.progress).toBe(0);
    expect(goal.completed).toBe(false);
  });

  it('setDailyGoal changes the target', () => {
    setDailyGoal(100);
    const goal = getDailyGoal();
    expect(goal.target).toBe(100);
  });

  it('setDailyGoal rejects invalid values', () => {
    const result = setDailyGoal(42);
    expect(result).toBe(false);
  });

  it('setDailyGoal accepts valid values', () => {
    expect(setDailyGoal(10)).toBe(true);
    expect(setDailyGoal(30)).toBe(true);
    expect(setDailyGoal(50)).toBe(true);
    expect(setDailyGoal(100)).toBe(true);
    expect(setDailyGoal(150)).toBe(true);
  });

  it('checkDailyGoal tracks progress', () => {
    setDailyGoal(30);
    addXP(15, 'quiz_correct');
    const check = checkDailyGoal();
    expect(check.progress).toBe(15);
    expect(check.target).toBe(30);
    expect(check.percentage).toBe(50);
    expect(check.completed).toBe(false);
  });

  it('checkDailyGoal completes when target reached', () => {
    setDailyGoal(10);
    addXP(15, 'quiz_correct');
    const check = checkDailyGoal();
    expect(check.completed).toBe(true);
    expect(check.percentage).toBe(100);
  });
});

// ============================================================================
// BADGES
// ============================================================================
describe('Badges', () => {
  it('getBadges returns all badges with unlocked=false by default', () => {
    const badges = getBadges();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every(b => b.unlocked === false)).toBe(true);
  });

  it('checkBadges unlocks first_day after recording activity', () => {
    recordActivity();
    const newBadges = checkBadges();
    expect(newBadges.some(b => b.id === 'first_day')).toBe(true);
  });

  it('checkBadges unlocks first_100xp after earning 100 XP', () => {
    addXP(100, 'lesson_complete');
    const newBadges = checkBadges();
    expect(newBadges.some(b => b.id === 'first_100xp')).toBe(true);
  });

  it('does not double-unlock badges', () => {
    recordActivity();
    checkBadges();
    const secondCheck = checkBadges();
    expect(secondCheck.some(b => b.id === 'first_day')).toBe(false);
  });

  it('getBadges reflects unlocked status', () => {
    recordActivity();
    checkBadges();
    const badges = getBadges();
    const firstDay = badges.find(b => b.id === 'first_day');
    expect(firstDay.unlocked).toBe(true);
    expect(firstDay.unlockedDate).toBeTruthy();
  });
});

// ============================================================================
// SPACED REPETITION
// ============================================================================
describe('Spaced Repetition', () => {
  it('addToReview adds a word', () => {
    addToReview('hund', 'Hund', 'cane');
    const stats = getReviewStats();
    expect(stats.totalWords).toBe(1);
  });

  it('getReviewWords returns due words', () => {
    addToReview('hund', 'Hund', 'cane');
    const words = getReviewWords();
    expect(words).toHaveLength(1);
    expect(words[0].german).toBe('Hund');
    expect(words[0].italian).toBe('cane');
  });

  it('recordReview correct pushes next review forward', () => {
    addToReview('hund', 'Hund', 'cane');
    recordReview('hund', true);
    const words = getReviewWords();
    // After correct review, word should no longer be due today
    expect(words).toHaveLength(0);
  });

  it('recordReview incorrect keeps word due soon', () => {
    addToReview('hund', 'Hund', 'cane');
    recordReview('hund', true); // push it forward
    recordReview('hund', false); // reset
    const stats = getReviewStats();
    expect(stats.learning).toBe(1);
  });

  it('getReviewStats tracks mastered vs learning', () => {
    addToReview('hund', 'Hund', 'cane');
    addToReview('katze', 'Katze', 'gatto');
    const stats = getReviewStats();
    expect(stats.totalWords).toBe(2);
    expect(stats.learning).toBe(2);
    expect(stats.mastered).toBe(0);
  });

  it('recordReview returns false for unknown words', () => {
    const result = recordReview('nonexistent', true);
    expect(result).toBe(false);
  });
});
