import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReadingPage from './ReadingPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'reading.title': 'Reading',
        'reading.texts': 'texts',
        'reading.noTexts': 'No reading texts available',
        'reading.readAloud': 'Read Aloud',
        'reading.comprehension': 'Comprehension',
        'reading.score': 'Score:',
        'reading.perfect': 'Perfect!',
        'reading.goodJob': 'Good job!',
        'reading.tryAgain': 'Try again!',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    READING_DATA: {
      levels: {
        A1: {
          texts: [
            {
              id: 'r1',
              title: 'Morning Routine',
              theme: 'Daily Life',
              text: 'Ich stehe um 7 Uhr auf.',
              difficultWords: [],
              questions: [{ question: 'When does the person wake up?', options: ['6', '7', '8'], correctAnswer: '7' }],
            },
            {
              id: 'r2',
              title: 'At the Cafe',
              theme: 'Social',
              text: 'Ich trinke einen Kaffee.',
              difficultWords: [],
              questions: [{ question: 'What does the person drink?', options: ['Wasser', 'Kaffee', 'Tee'], correctAnswer: 'Kaffee' }],
            },
          ],
        },
        A2: {
          texts: [
            {
              id: 'r3',
              title: 'Holiday Plans',
              theme: 'Travel',
              text: 'Ich reise nach Berlin.',
              difficultWords: [],
              questions: [{ question: 'Where is the person traveling?', options: ['Munich', 'Berlin', 'Hamburg'], correctAnswer: 'Berlin' }],
            },
          ],
        },
        B1: { texts: [] },
      },
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  getWordStatus: () => 'unseen',
  isDifficultWord: () => false,
}));

vi.mock('../utils/cloudSync', () => ({ saveAndSync: vi.fn() }));
vi.mock('../utils/gamification', () => ({ addXP: vi.fn() }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

vi.mock('../components/LevelTabs', () => ({
  default: ({ currentLevel, onLevelChange }) => (
    <div data-testid="level-tabs">
      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
        <button key={l} onClick={() => onLevelChange(l)} className={l === currentLevel ? 'active' : ''}>
          {l}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', text: '#fff' },
    A2: { bg: '#3b82f6', text: '#fff' },
    B1: { bg: '#8b5cf6', text: '#fff' },
    B2: { bg: '#f59e0b', text: '#fff' },
    C1: { bg: '#ef4444', text: '#fff' },
    C2: { bg: '#dc2626', text: '#fff' },
  },
  getLevelName: (lvl) => ({ A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery' }[lvl] || lvl),
}));

describe('ReadingPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };
  });

  describe('List View', () => {
    it('renders page title', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Reading')).toBeTruthy();
    });

    it('shows reading texts count for A1', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByText(/2 texts/)).toBeTruthy();
    });

    it('shows level name in subtitle', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByText(/Beginner/)).toBeTruthy();
    });

    it('renders level tabs', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByTestId('level-tabs')).toBeTruthy();
    });

    it('displays reading text titles', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Morning Routine')).toBeTruthy();
      expect(screen.getByText('At the Cafe')).toBeTruthy();
    });

    it('shows theme for each reading text', () => {
      render(<ReadingPage onNavigate={onNavigate} />);
      expect(screen.getByText('Daily Life')).toBeTruthy();
      expect(screen.getByText('Social')).toBeTruthy();
    });

    it('shows empty state for levels with no texts', () => {
      render(<ReadingPage level="B1" onNavigate={onNavigate} />);
      expect(screen.getByText('No reading texts available')).toBeTruthy();
    });
  });
});
