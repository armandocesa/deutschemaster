import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EssentialWordsPage from './EssentialWordsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'essentialWords.title': 'Essential Words',
        'essentialWords.search': 'Search...',
        'essentialWords.noResults': 'No results found',
        'vocabulary.words': 'words',
        'vocabulary.colWord': 'Word',
        'vocabulary.colTranslation': 'Translation',
        'vocabulary.colCategory': 'Category',
        'vocabulary.colActions': 'Actions',
        'vocabulary.loadMore': 'Load more',
        'vocabulary.remaining': 'remaining',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', text: '#fff' }, A2: { bg: '#3b82f6', text: '#fff' },
    B1: { bg: '#8b5cf6', text: '#fff' }, B2: { bg: '#f59e0b', text: '#fff' },
    C1: { bg: '#ef4444', text: '#fff' }, C2: { bg: '#dc2626', text: '#fff' },
  },
  getLevelName: (lvl) => ({ A1: 'Beginner' }[lvl] || lvl),
}));

vi.mock('../utils/storage', () => ({
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
  default: ({ currentLevel }) => <div data-testid="level-tabs">{currentLevel}</div>,
}));

const mockData = {
  categories: [
    { name: 'animals', words: [
      { german: 'Hund', italian: 'cane', article: 'der' },
      { german: 'Katze', italian: 'gatto', article: 'die' },
    ]},
    { name: 'food', words: [
      { german: 'Brot', italian: 'pane', article: 'das' },
    ]},
  ],
};

describe('EssentialWordsPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve(mockData) }));
  });

  it('shows loading skeleton initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    const { container } = render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders title after loading', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Essential Words')).toBeTruthy();
    });
  });

  it('shows word count', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText(/3 words/)).toBeTruthy();
    });
  });

  it('renders words in table', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Hund')).toBeTruthy();
      expect(screen.getByText('Katze')).toBeTruthy();
      expect(screen.getByText('Brot')).toBeTruthy();
    });
  });

  it('shows translations', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('cane')).toBeTruthy();
      expect(screen.getByText('gatto')).toBeTruthy();
    });
  });

  it('has search input', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
    });
  });

  it('renders level tabs', async () => {
    render(<EssentialWordsPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByTestId('level-tabs')).toBeTruthy();
    });
  });
});
