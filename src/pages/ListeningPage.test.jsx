import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ListeningPage from './ListeningPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'listening.title': 'Listening Practice',
        'listening.subtitle': 'Train your ear',
        'listening.exerciseType': 'Exercise Type',
        'listening.dictation': 'Dictation',
        'listening.comprehension': 'Comprehension',
        'listening.gapFill': 'Gap Fill',
        'listening.level': 'Level',
        'listening.exerciseCount': 'Exercises',
        'listening.start': 'Start',
        'listening.noExercises': 'No exercises available',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    VOCABULARY_DATA: { levels: { A1: { modules: [{ words: [{ german: 'Hund', italian: 'cane' }] }] } } },
  }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', text: '#fff' }, A2: { bg: '#3b82f6', text: '#fff' },
    B1: { bg: '#8b5cf6', text: '#fff' }, B2: { bg: '#f59e0b', text: '#fff' },
    C1: { bg: '#ef4444', text: '#fff' }, C2: { bg: '#dc2626', text: '#fff' },
  },
  fisherYatesShuffle: (arr) => [...arr],
}));

vi.mock('../utils/gamification', () => ({ addXP: vi.fn(), recordActivity: vi.fn() }));
vi.mock('../utils/speech', () => ({ speak: vi.fn() }));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({
    canAccessLevel: () => true,
    requiresAuth: () => false,
    isAuthenticated: false,
  }),
}));

vi.mock('../components/LevelAccessModal', () => ({ default: () => null }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('ListeningPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: {} }) }));
  });

  describe('Setup Screen', () => {
    it('renders title', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText('Listening Practice')).toBeTruthy();
    });

    it('shows subtitle', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText('Train your ear')).toBeTruthy();
    });

    it('shows exercise type options', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText(/Dictation/)).toBeTruthy();
      expect(screen.getByText(/Comprehension/)).toBeTruthy();
      expect(screen.getByText(/Gap Fill/)).toBeTruthy();
    });

    it('shows level buttons', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText('A1')).toBeTruthy();
      expect(screen.getByText('B1')).toBeTruthy();
      expect(screen.getByText('C2')).toBeTruthy();
    });

    it('shows exercise count options', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('15')).toBeTruthy();
    });

    it('has start button', () => {
      render(<ListeningPage onNavigate={onNavigate} />);
      expect(screen.getByText('Start')).toBeTruthy();
    });
  });
});
