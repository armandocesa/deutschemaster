import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WritingPage from './WritingPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'writing.title': 'Writing Practice',
        'writing.setupSubtitle': 'Improve your writing skills',
        'writing.exerciseType': 'Exercise Type',
        'writing.translate': 'Translation',
        'writing.completion': 'Completion',
        'writing.reorder': 'Reorder',
        'writing.freeWriting': 'Free Writing',
        'writing.level': 'Level',
        'writing.exerciseCount': 'Exercises',
        'writing.start': 'Start',
        'writing.loading': 'Loading...',
        'writing.translateTo': 'Translate to German',
        'writing.complete': 'Complete the sentence',
        'writing.order': 'Put words in order',
        'writing.write': 'Write freely',
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

describe('WritingPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: {} }) }));
  });

  describe('Setup Screen', () => {
    it('renders title', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Writing Practice')).toBeTruthy();
    });

    it('shows subtitle', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Improve your writing skills')).toBeTruthy();
    });

    it('shows exercise type options', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Translation')).toBeTruthy();
      expect(screen.getByText('Completion')).toBeTruthy();
      expect(screen.getByText('Reorder')).toBeTruthy();
      expect(screen.getByText('Free Writing')).toBeTruthy();
    });

    it('shows level buttons', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      expect(screen.getByText('A1')).toBeTruthy();
      expect(screen.getByText('B1')).toBeTruthy();
      expect(screen.getByText('C2')).toBeTruthy();
    });

    it('shows exercise count options', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('15')).toBeTruthy();
      expect(screen.getByText('20')).toBeTruthy();
    });

    it('has start button', () => {
      render(<WritingPage onNavigate={onNavigate} />);
      // Initially shows Loading until data arrives
      const btn = screen.getByText(/Start|Loading/);
      expect(btn).toBeTruthy();
    });
  });
});
