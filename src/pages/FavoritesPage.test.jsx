import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoritesPage from './FavoritesPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'favorites.title': 'Saved Words',
        'favorites.items': 'items',
        'favorites.words': 'words',
        'favorites.verbs': 'verbs',
        'favorites.filter': 'All',
        'favorites.words_filter': 'Words',
        'favorites.verbs_filter': 'Verbs',
        'favorites.quiz': 'Quiz from saved',
        'favorites.empty': 'No saved words yet',
        'favorites.hint': 'Save words while studying',
        'favorites.verb_type': 'verb',
        'favorites.word_type': 'word',
        'home.vocabularyTitle': 'Vocabulary',
        'home.grammarTitle': 'Grammar',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

const mockWords = [
  { id: 'w1', german: 'Hund', italian: 'cane', article: 'der', type: 'word' },
  { id: 'w2', german: 'Katze', italian: 'gatto', article: 'die', type: 'word' },
  { id: 'v1', infinitiv: 'gehen', italiano: 'andare', type: 'verb' },
  { id: 'v2', infinitiv: 'machen', italiano: 'fare', type: 'verb' },
  { id: 'w3', german: 'Haus', italian: 'casa', article: 'das', type: 'word' },
];

let mockGetDifficultWords;
const mockRemoveDifficultWord = vi.fn();

vi.mock('../utils/storage', () => ({
  getDifficultWords: () => mockGetDifficultWords(),
  removeDifficultWord: (...args) => mockRemoveDifficultWord(...args),
}));

describe('FavoritesPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    mockGetDifficultWords = () => [...mockWords];
    mockRemoveDifficultWord.mockClear();
  });

  it('renders page title', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('Saved Words')).toBeTruthy();
  });

  it('shows correct item counts', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText(/5 items/)).toBeTruthy();
    expect(screen.getByText(/3 words/)).toBeTruthy();
    expect(screen.getByText(/2 verbs/)).toBeTruthy();
  });

  it('renders all saved words', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('der Hund')).toBeTruthy();
    expect(screen.getByText('die Katze')).toBeTruthy();
    expect(screen.getByText('gehen')).toBeTruthy();
  });

  it('shows filter buttons', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('All (5)')).toBeTruthy();
    expect(screen.getByText('Words (3)')).toBeTruthy();
    expect(screen.getByText('Verbs (2)')).toBeTruthy();
  });

  it('filters by words', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Words (3)'));
    expect(screen.getByText('der Hund')).toBeTruthy();
    expect(screen.queryByText('gehen')).toBeNull();
  });

  it('filters by verbs', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Verbs (2)'));
    expect(screen.getByText('gehen')).toBeTruthy();
    expect(screen.queryByText('der Hund')).toBeNull();
  });

  it('removes a word on button click', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    const removeButtons = screen.getAllByTitle('Remove');
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveDifficultWord).toHaveBeenCalledWith('w1');
    expect(screen.queryByText('der Hund')).toBeNull();
  });

  it('shows quiz button when 4+ items', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('Quiz from saved')).toBeTruthy();
  });

  it('navigates to quiz on quiz button click', () => {
    render(<FavoritesPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Quiz from saved'));
    expect(onNavigate).toHaveBeenCalledWith('quiz', { difficultOnly: true });
  });

  it('shows empty state when no words saved', () => {
    mockGetDifficultWords = () => [];
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('No saved words yet')).toBeTruthy();
    expect(screen.getByText('Save words while studying')).toBeTruthy();
  });

  it('shows navigation buttons in empty state', () => {
    mockGetDifficultWords = () => [];
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.getByText('Vocabulary')).toBeTruthy();
    fireEvent.click(screen.getByText('Vocabulary'));
    expect(onNavigate).toHaveBeenCalledWith('vocabulary', { level: 'A1' });
  });

  it('hides quiz button when less than 4 items', () => {
    mockGetDifficultWords = () => [mockWords[0], mockWords[1]];
    render(<FavoritesPage onNavigate={onNavigate} />);
    expect(screen.queryByText('Quiz from saved')).toBeNull();
  });
});
