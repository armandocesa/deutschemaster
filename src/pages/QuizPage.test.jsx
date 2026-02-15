import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizPage from './QuizPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'quiz.title': 'Quiz',
        'quiz.subtitle': 'Test your knowledge',
        'quiz.quizType': 'Quiz Type',
        'quiz.vocabulary': 'Vocabulary',
        'quiz.grammar': 'Grammar',
        'quiz.level': 'Level',
        'quiz.start': 'Start Quiz',
        'quiz.whatMeans': 'What does',
        'quiz.completed': 'Completed!',
        'quiz.correct': 'out of',
        'quiz.retry': 'Try Again',
        'quiz.newQuiz': 'New Quiz',
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
          modules: [{ name: 'Basics', words: [
            { german: 'Hund', italian: 'cane', article: 'der' },
            { german: 'Katze', italian: 'gatto', article: 'die' },
            { german: 'Haus', italian: 'casa', article: 'das' },
            { german: 'Baum', italian: 'albero', article: 'der' },
            { german: 'Buch', italian: 'libro', article: 'das' },
            { german: 'Tisch', italian: 'tavolo', article: 'der' },
            { german: 'Stuhl', italian: 'sedia', article: 'der' },
            { german: 'Wasser', italian: 'acqua', article: 'das' },
            { german: 'Brot', italian: 'pane', article: 'das' },
            { german: 'Milch', italian: 'latte', article: 'die' },
            { german: 'Apfel', italian: 'mela', article: 'der' },
          ]}],
        },
      },
    },
    GRAMMAR_DATA: { levels: {} },
  }),
}));

vi.mock('../utils/storage', () => ({
  getDifficultWords: () => [],
  updateQuizStats: vi.fn(),
  markWordStatus: vi.fn(),
  markGrammarStatus: vi.fn(),
  isReviewQuestion: () => false,
  saveReviewQuestion: vi.fn(),
  removeReviewQuestion: vi.fn(),
}));

vi.mock('../utils/gamification', () => ({
  addXP: vi.fn(),
  recordActivity: vi.fn(),
  addToReview: vi.fn(),
}));

vi.mock('../utils/cloudSync', () => ({
  saveAndSync: vi.fn(),
}));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({ canAccessLevel: () => true }),
}));

vi.mock('../components/LevelAccessModal', () => ({
  default: () => null,
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
  fisherYatesShuffle: (arr) => [...arr],
}));

describe('QuizPage - Setup', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders quiz title', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('Quiz')).toBeTruthy();
  });

  it('renders quiz type selection', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('Vocabulary')).toBeTruthy();
    expect(screen.getByText('Grammar')).toBeTruthy();
  });

  it('renders level selector with all 6 levels', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('A1')).toBeTruthy();
    expect(screen.getByText('A2')).toBeTruthy();
    expect(screen.getByText('B1')).toBeTruthy();
    expect(screen.getByText('B2')).toBeTruthy();
    expect(screen.getByText('C1')).toBeTruthy();
    expect(screen.getByText('C2')).toBeTruthy();
  });

  it('shows Start Quiz button', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    expect(screen.getByText('Start Quiz')).toBeTruthy();
  });

  it('starts quiz and shows questions', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Start Quiz'));
    // After starting, setup should be gone and question displayed
    expect(screen.queryByText('Start Quiz')).toBeNull();
  });

  it('defaults vocabulary type as active', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    const vocabBtn = screen.getByText('Vocabulary').closest('button');
    expect(vocabBtn.classList.contains('active')).toBe(true);
  });

  it('switches quiz type to grammar', () => {
    render(<QuizPage level="A1" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Grammar'));
    const grammarBtn = screen.getByText('Grammar').closest('button');
    expect(grammarBtn.classList.contains('active')).toBe(true);
  });

  it('uses provided level prop', () => {
    render(<QuizPage level="B1" onNavigate={onNavigate} />);
    const b1Btn = screen.getByText('B1').closest('button');
    expect(b1Btn.classList.contains('active')).toBe(true);
  });
});
