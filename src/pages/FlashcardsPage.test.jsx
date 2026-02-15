import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardsPage from './FlashcardsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'flashcards.title': 'Flashcards',
        'flashcards.subtitle': 'Study with flashcards',
        'flashcards.chooseSource': 'Choose source',
        'flashcards.byLevel': 'By Level',
        'flashcards.byLevelDescription': 'Study words from a level',
        'flashcards.scheduledReview': 'Scheduled Review',
        'flashcards.reviewWaiting': 'words waiting',
        'flashcards.difficultWords': 'Difficult Words',
        'flashcards.wordsSaved': 'words saved',
        'flashcards.level': 'Level',
        'flashcards.cardCount': 'Cards per session',
        'flashcards.start': 'Start',
        'flashcards.card': 'Card',
        'flashcards.of': 'of',
        'flashcards.tap': 'Tap to flip',
        'flashcards.iKnow': 'I know',
        'flashcards.iDontKnow': "I don't know",
        'flashcards.sessionCompleted': 'Session Completed',
        'flashcards.results': 'Results',
        'flashcards.correct': 'Correct',
        'flashcards.incorrect': 'Incorrect',
        'flashcards.total': 'Total',
        'flashcards.xpEarned': 'XP Earned',
        'flashcards.retry': 'Retry',
        'flashcards.newSession': 'New Session',
        'flashcards.back': 'Back',
        'flashcards.noCards': 'No cards available',
        'flashcards.noCardsHint': 'Try changing source or level',
        'flashcards.showAll': 'Show All',
        'flashcards.hideAll': 'Hide All',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    VOCABULARY_DATA: {
      levels: {
        A1: {
          modules: [{
            name: 'Animals',
            words: [
              { german: 'Hund', italian: 'cane', article: 'der' },
              { german: 'Katze', italian: 'gatto', article: 'die' },
              { german: 'Vogel', italian: 'uccello', article: 'der' },
            ],
          }],
        },
      },
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  getDifficultWords: () => [],
  getProgress: () => ({ words: {} }),
  markWordStatus: vi.fn(),
  saveProgress: vi.fn(),
}));

vi.mock('../utils/gamification', () => ({
  addXP: vi.fn(),
  recordActivity: vi.fn(),
}));

vi.mock('../utils/speech', () => ({ speak: vi.fn() }));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', light: '#d1fae5', text: '#065f46' },
    A2: { bg: '#3b82f6', light: '#dbeafe', text: '#1e40af' },
    B1: { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' },
    B2: { bg: '#f59e0b', light: '#fef3c7', text: '#92400e' },
    C1: { bg: '#ef4444', light: '#fee2e2', text: '#991b1b' },
    C2: { bg: '#dc2626', light: '#fee2e2', text: '#991b1b' },
  },
  fisherYatesShuffle: (arr) => [...arr],
}));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({
    canAccessLevel: () => true,
    requiresAuth: () => false,
    isAuthenticated: false,
  }),
}));

vi.mock('../components/LevelAccessModal', () => ({
  default: () => null,
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('FlashcardsPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    // Mock speechSynthesis
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };
  });

  describe('Setup Screen', () => {
    it('renders title', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      expect(screen.getByText('Flashcards')).toBeTruthy();
    });

    it('shows source options', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      expect(screen.getByText('By Level')).toBeTruthy();
      expect(screen.getByText('Scheduled Review')).toBeTruthy();
      expect(screen.getByText('Difficult Words')).toBeTruthy();
    });

    it('shows level selector for "By Level" source', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      expect(screen.getByText('A1')).toBeTruthy();
      expect(screen.getByText('B1')).toBeTruthy();
      expect(screen.getByText('C2')).toBeTruthy();
    });

    it('shows card count options', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('20')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
      expect(screen.getByText('50')).toBeTruthy();
    });

    it('has start button', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      expect(screen.getByText('Start')).toBeTruthy();
    });

    it('starts session on click', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Start'));
      // Should now show playing screen with first card
      expect(screen.getByText('Hund')).toBeTruthy();
    });
  });

  describe('Playing Screen', () => {
    it('shows card content after start', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Start'));
      // Card 1 of 3
      expect(screen.getByText(/Card/)).toBeTruthy();
      expect(screen.getByText(/1/)).toBeTruthy();
    });

    it('shows article on card', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Start'));
      expect(screen.getByText('der')).toBeTruthy();
    });

    it('has tap to flip hint', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Start'));
      expect(screen.getAllByText('Tap to flip').length).toBeGreaterThanOrEqual(1);
    });

    it('has back button', () => {
      render(<FlashcardsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Start'));
      expect(screen.getByLabelText('Back to setup')).toBeTruthy();
    });
  });
});
