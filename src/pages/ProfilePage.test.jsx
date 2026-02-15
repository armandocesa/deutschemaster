import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from './ProfilePage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key, // Return key so we can match on key patterns
  }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    logout: vi.fn(),
    firebaseEnabled: true,
  }),
}));

vi.mock('../utils/gamification', () => ({
  getStreak: () => ({ currentStreak: 5, longestStreak: 12, lastActiveDate: '2026-02-15', calendar: {} }),
  getStreakCalendar: () => [
    { day: 1, active: false }, { day: 2, active: true }, { day: 3, active: true },
  ],
  getXP: () => ({ totalXP: 1500, todayXP: 80, level: 8, xpInCurrentLevel: 200, xpForNextLevel: 500 }),
  getXPHistory: () => [],
  getDailyGoal: () => ({ target: 50, completedDates: [] }),
  setDailyGoal: vi.fn(),
  checkDailyGoal: () => ({ progress: 30, target: 50, percentage: 60, completed: false }),
  getBadges: () => [
    { id: 'first_quiz', name: 'First Quiz', description: 'Complete first quiz', icon: '🎯', unlocked: true, unlockedDate: '2026-02-10' },
    { id: 'streak_7', name: '7 Day Streak', description: 'Keep a 7-day streak', icon: '🔥', unlocked: false, unlockedDate: null },
  ],
}));

vi.mock('../utils/storage', () => ({
  getQuizStats: () => ({ totalAnswered: 200, correctAnswers: 150 }),
  getProgressStats: () => ({ words: 0, grammar: 0, verbs: 0 }),
  getDifficultWords: () => [{ id: 'w1' }, { id: 'w2' }],
}));

vi.mock('../utils/notifications', () => ({
  requestPermission: vi.fn(),
  isEnabled: () => false,
  setEnabled: vi.fn(),
  getReminderTime: () => '09:00',
  setReminderTime: vi.fn(),
  scheduleReminder: vi.fn(),
}));

describe('ProfilePage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders without crashing', () => {
    const { container } = render(<ProfilePage onNavigate={onNavigate} />);
    expect(container.querySelector('.profile-container')).toBeTruthy();
  });

  it('renders profile title key', () => {
    render(<ProfilePage onNavigate={onNavigate} />);
    expect(screen.getByText('profile.title')).toBeTruthy();
  });

  it('shows daily goal section', () => {
    render(<ProfilePage onNavigate={onNavigate} />);
    expect(screen.getByText('profile.dailyGoal.title')).toBeTruthy();
  });

  it('shows badge data', () => {
    render(<ProfilePage onNavigate={onNavigate} />);
    expect(screen.getByText('First Quiz')).toBeTruthy();
    expect(screen.getByText('7 Day Streak')).toBeTruthy();
  });

  it('shows streak numbers', () => {
    const { container } = render(<ProfilePage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('5');
    expect(container.textContent).toContain('12');
  });

  it('shows XP total', () => {
    const { container } = render(<ProfilePage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('1,500');
  });

  it('shows sign-in section when not authenticated', () => {
    const { container } = render(<ProfilePage onNavigate={onNavigate} />);
    // When not authenticated, should show login prompt
    expect(container.textContent).toContain('profile.signInButton');
  });
});
