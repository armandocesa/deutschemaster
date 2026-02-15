import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './HomePage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'home.welcome': 'Welcome to', 'home.language': 'German learning',
        'home.subtitle': 'Start learning today', 'home.study': 'Study',
        'home.practice': 'Practice', 'home.stats.words': 'Words',
        'home.stats.grammar': 'Grammar', 'home.stats.verbs': 'Verbs',
        'home.stats.exercises': 'Exercises', 'home.vocabularyTitle': 'Vocabulary',
        'home.grammarTitle': 'Grammar', 'home.quizTitle': 'Quiz',
        'home.verbsTitle': 'Verbs', 'home.storiesTitle': 'Stories',
        'home.readingTitle': 'Reading', 'home.essentialWordsTitle': 'Essential Words',
        'home.flashcardsTitle': 'Flashcards', 'home.writingTitle': 'Writing',
        'home.listeningTitle': 'Listening', 'home.quickPractice': 'Quick Practice',
        'home.verbPrefixes': 'Verb Prefixes', 'home.pathsTitle': 'Learning Paths',
        'home.lessonsTitle': 'Lessons', 'home.werdenTitle': 'Werden',
        'home.testPositioning': 'Placement Test', 'home.new': 'NEW',
        'home.toDo': 'to review', 'home.progress.title': 'Your Progress',
        'home.progress.questionsAsked': 'Questions', 'home.progress.correct': 'correct',
        'home.progress.savedWords': 'Saved Words', 'home.progress.toReview': 'to review',
        'home.placement.title': 'Find your level',
        'home.placement.subtitle': 'Take a quick test',
        'home.placement.button': 'Start test', 'home.review.title': 'Review',
        'home.review.subtitle': 'words to review', 'home.levels.beginner': 'Beginner',
        'nav.saved': 'Saved', 'days': 'days', 'profile.dailyGoal.title': 'Daily Goal',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    VOCABULARY_DATA: { statistics: { totalWords: 14315 } },
    GRAMMAR_DATA: { statistics: { totalTopics: 177, totalExercises: 261 } },
    VERBS_DATA: { statistics: { totalVerbs: 414 } },
  }),
}));

vi.mock('../utils/storage', () => ({
  getQuizStats: () => ({ totalAnswered: 100, correctAnswers: 75 }),
  getDifficultWords: () => [{ id: 'w1' }, { id: 'w2' }],
}));

vi.mock('../utils/gamification', () => ({
  getStreak: () => ({ currentStreak: 7, longestStreak: 14 }),
  getXP: () => ({ totalXP: 2500, todayXP: 50, level: 12, xpInCurrentLevel: 200, xpForNextLevel: 500 }),
  checkDailyGoal: () => ({ progress: 30, target: 50, percentage: 60, completed: false }),
  recordActivity: vi.fn(),
  getReviewStats: () => ({ dueToday: 5, totalWords: 20 }),
  checkBadges: vi.fn(),
}));

vi.mock('../utils/cloudSync', () => ({
  saveAndSync: vi.fn((key, val) => localStorage.setItem(key, val)),
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

vi.mock('../components/Onboarding', () => ({
  default: ({ onComplete }) => (
    <div data-testid="onboarding"><button onClick={onComplete}>Done</button></div>
  ),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981' }, A2: { bg: '#3b82f6' }, B1: { bg: '#8b5cf6' },
    B2: { bg: '#f59e0b' }, C1: { bg: '#ef4444' }, C2: { bg: '#dc2626' },
  },
}));

describe('HomePage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders welcome message', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('Welcome to')).toBeTruthy();
  });

  it('renders stats bar', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('14,315')).toBeTruthy();
    expect(screen.getByText('177')).toBeTruthy();
    expect(screen.getByText('414')).toBeTruthy();
  });

  it('renders streak count', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('renders XP and level', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('2500')).toBeTruthy();
    expect(screen.getByText(/Lv\. 12/)).toBeTruthy();
  });

  it('renders daily goal', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('60%')).toBeTruthy();
    expect(screen.getByText('30/50 XP')).toBeTruthy();
  });

  it('shows progress section', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText(/75%/)).toBeTruthy();
  });

  it('shows placement test when not taken', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('Find your level')).toBeTruthy();
  });

  it('hides placement when taken', () => {
    localStorage.setItem('dm_placement_level', 'B1');
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.queryByText('Find your level')).toBeNull();
  });

  it('shows onboarding for new users', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByTestId('onboarding')).toBeTruthy();
  });

  it('hides onboarding when already done', () => {
    localStorage.setItem('dm_onboarding_done', 'true');
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.queryByTestId('onboarding')).toBeNull();
  });

  it('dismisses onboarding on complete', () => {
    render(<HomePage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Done'));
    expect(screen.queryByTestId('onboarding')).toBeNull();
  });

  it('renders study cards', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('Vocabulary')).toBeTruthy();
    expect(screen.getAllByText('Grammar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Quiz')).toBeTruthy();
  });

  it('renders practice cards', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('Flashcards')).toBeTruthy();
    expect(screen.getAllByText('Writing').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Listening').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to placement test', () => {
    render(<HomePage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Start test'));
    expect(onNavigate).toHaveBeenCalledWith('placement-test');
  });

  it('shows review reminder', () => {
    render(<HomePage onNavigate={onNavigate} />);
    expect(screen.getByText('Review')).toBeTruthy();
  });
});
