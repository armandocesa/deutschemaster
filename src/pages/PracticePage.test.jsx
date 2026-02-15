import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PracticePage from './PracticePage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'practice.title': 'Practice',
        'practice.subtitle': 'Review all vocabulary',
        'practice.search': 'Search words...',
        'practice.words': 'words',
        'practice.revealed': 'revealed',
        'practice.showAll': 'Show All',
        'practice.hideAll': 'Hide All',
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
        A2: {
          modules: [{
            name: 'Food',
            words: [
              { german: 'Brot', italian: 'pane', article: 'das' },
            ],
          }],
        },
      },
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  getWordStatus: () => 'new',
}));

vi.mock('../utils/speech', () => ({
  speak: vi.fn(),
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981' }, A2: { bg: '#3b82f6' }, B1: { bg: '#8b5cf6' },
    B2: { bg: '#f59e0b' }, C1: { bg: '#ef4444' }, C2: { bg: '#dc2626' },
  },
}));

describe('PracticePage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
  });

  it('renders page title', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    expect(screen.getByText('Practice')).toBeTruthy();
  });

  it('shows word count', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    expect(screen.getByText(/4/)).toBeTruthy(); // 3 + 1 words total
  });

  it('renders words in the list', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    expect(screen.getByText('Brot')).toBeTruthy();
    expect(screen.getByText('Hund')).toBeTruthy();
    expect(screen.getByText('Katze')).toBeTruthy();
  });

  it('hides translations by default', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    // Translations hidden with '• • •'
    const hidden = screen.getAllByText('• • •');
    expect(hidden.length).toBe(4);
  });

  it('reveals translation on click', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Hund'));
    expect(screen.getByText('cane')).toBeTruthy();
  });

  it('has search input', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    const input = screen.getByPlaceholderText('Search words...');
    expect(input).toBeTruthy();
  });

  it('filters words by search term', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    const input = screen.getByPlaceholderText('Search words...');
    fireEvent.change(input, { target: { value: 'Hund' } });
    expect(screen.getByText('Hund')).toBeTruthy();
    expect(screen.queryByText('Brot')).toBeNull();
  });

  it('has mode toggle buttons', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    const buttons = screen.getAllByRole('button');
    // Should have DE→IT and IT→DE toggle buttons among others
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('has Show All button', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    expect(screen.getByText('Show All')).toBeTruthy();
  });

  it('shows all translations when Show All clicked', () => {
    render(<PracticePage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Show All'));
    expect(screen.getByText('cane')).toBeTruthy();
    expect(screen.getByText('gatto')).toBeTruthy();
    expect(screen.getByText('pane')).toBeTruthy();
  });
});
