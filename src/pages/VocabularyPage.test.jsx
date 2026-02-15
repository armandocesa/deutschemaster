import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VocabularyPage from './VocabularyPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'vocabulary.title': 'Vocabulary',
        'vocabulary.words': 'words',
        'vocabulary.search': 'Search...',
        'vocabulary.correct': 'correct',
        'vocabulary.incorrect': 'incorrect',
        'vocabulary.unseen': 'unseen',
        'vocabulary.filterAll': 'All',
        'vocabulary.filterSaved': 'Saved',
        'vocabulary.filterCorrect': 'Correct',
        'vocabulary.filterIncorrect': 'Incorrect',
        'vocabulary.filterUnseen': 'Unseen',
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
              { german: 'Vogel', italian: 'uccello', article: 'der', plural: 'Vögel' },
            ],
          }, {
            name: 'Food',
            words: [
              { german: 'Brot', italian: 'pane', article: 'das' },
            ],
          }],
        },
        B1: { modules: [{ name: 'Advanced', words: [{ german: 'Umwelt', italian: 'ambiente', article: 'die' }] }] },
      },
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  getWordStatus: () => 'unseen',
  isDifficultWord: () => false,
  saveDifficultWord: vi.fn(),
  removeDifficultWord: vi.fn(),
}));

vi.mock('../utils/speech', () => ({ speak: vi.fn() }));
vi.mock('../utils/cloudSync', () => ({ saveAndSync: vi.fn() }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

vi.mock('../components/LevelTabs', () => ({
  default: ({ currentLevel, onLevelChange }) => (
    <div data-testid="level-tabs">
      {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
        <button key={l} onClick={() => onLevelChange(l)} className={l === currentLevel ? 'active' : ''}>{l}</button>
      ))}
    </div>
  ),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', text: '#fff' }, A2: { bg: '#3b82f6', text: '#fff' },
    B1: { bg: '#8b5cf6', text: '#fff' }, B2: { bg: '#f59e0b', text: '#fff' },
    C1: { bg: '#ef4444', text: '#fff' }, C2: { bg: '#dc2626', text: '#fff' },
  },
  getLevelName: (lvl) => ({ A1: 'Beginner', B1: 'Intermediate' }[lvl] || lvl),
}));

describe('VocabularyPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders page title', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('Vocabulary')).toBeTruthy();
  });

  it('shows word count for A1', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText(/4 words/)).toBeTruthy();
  });

  it('shows level name', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText(/Beginner/)).toBeTruthy();
  });

  it('renders word rows', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('Hund')).toBeTruthy();
    expect(screen.getByText('Katze')).toBeTruthy();
    expect(screen.getByText('Brot')).toBeTruthy();
  });

  it('renders translations', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('cane')).toBeTruthy();
    expect(screen.getByText('gatto')).toBeTruthy();
  });

  it('shows articles', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getAllByText('der').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('die').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('das').length).toBeGreaterThanOrEqual(1);
  });

  it('shows category badges', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getAllByText('Animals').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Food').length).toBeGreaterThanOrEqual(1);
  });

  it('has search input', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  it('renders filter buttons', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText(/^All/)).toBeTruthy();
    expect(screen.getByText(/^Saved/)).toBeTruthy();
    expect(screen.getByText(/^Unseen/)).toBeTruthy();
  });

  it('renders level tabs', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByTestId('level-tabs')).toBeTruthy();
  });

  it('shows progress summary', () => {
    render(<VocabularyPage level="A1" onNavigate={onNavigate} />);
    // All words are 'unseen' (mocked)
    expect(screen.getByText(/unseen/)).toBeTruthy();
  });
});
