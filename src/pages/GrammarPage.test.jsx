import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GrammarPage from './GrammarPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'grammar.title': 'Grammar',
        'grammar.topics': 'topics',
        'grammar.answer': 'Answer:',
        'grammar.explanation': 'Explanation:',
        'lessons.exercises': 'Exercises',
        'show': 'Show',
        'hide': 'Hide',
        'answer': 'answer',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    GRAMMAR_DATA: {
      levels: {
        A1: {
          title: 'Beginner Grammar',
          topics: [
            {
              id: 'articles',
              name: 'Articles',
              explanation: 'Learn about der/die/das',
              content: {
                regola: 'German has three articles.',
                esempi: [
                  { tedesco: 'der Hund', italiano: 'il cane' },
                  { tedesco: 'die Katze', italiano: 'il gatto' },
                ],
              },
              exercises: [
                { question: 'What is "the dog"?', answer: 'der Hund', explanation: 'Hund is masculine' },
                { question: 'What is "the cat"?', answer: 'die Katze' },
              ],
            },
            {
              id: 'verbs_intro',
              name: 'Verb Basics',
              explanation: 'Introduction to verbs',
            },
          ],
        },
        B1: { title: 'Intermediate', topics: [{ id: 'modal', name: 'Modal Verbs', explanation: 'können, müssen...' }] },
      },
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  getGrammarStatus: () => 'unseen',
}));

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

describe('GrammarPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  describe('Topic List View', () => {
    it('renders page title', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByText('Grammar')).toBeTruthy();
    });

    it('shows topic count', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByText(/2 topics/)).toBeTruthy();
    });

    it('renders topic names', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByText('Articles')).toBeTruthy();
      expect(screen.getByText('Verb Basics')).toBeTruthy();
    });

    it('shows topic explanations', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByText('Learn about der/die/das')).toBeTruthy();
    });

    it('shows exercise count badge', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByText('2 ex.')).toBeTruthy();
    });

    it('renders level tabs', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      expect(screen.getByTestId('level-tabs')).toBeTruthy();
    });

    it('navigates to topic on click', () => {
      render(<GrammarPage level="A1" onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Articles'));
      expect(onNavigate).toHaveBeenCalledWith('grammar', expect.objectContaining({ topic: expect.objectContaining({ name: 'Articles' }) }));
    });
  });

  describe('Topic Detail View', () => {
    const topic = {
      id: 'articles',
      name: 'Articles',
      explanation: 'Learn about der/die/das',
      content: {
        regola: 'German has three articles.',
        esempi: [
          { tedesco: 'der Hund', italiano: 'il cane' },
          { tedesco: 'die Katze', italiano: 'il gatto' },
        ],
      },
      exercises: [
        { question: 'What is "the dog"?', answer: 'der Hund', explanation: 'Hund is masculine' },
        { question: 'What is "the cat"?', answer: 'die Katze' },
      ],
    };

    it('renders topic title', () => {
      render(<GrammarPage level="A1" topic={topic} onNavigate={onNavigate} />);
      expect(screen.getByText('Articles')).toBeTruthy();
    });

    it('renders regola content', () => {
      render(<GrammarPage level="A1" topic={topic} onNavigate={onNavigate} />);
      expect(screen.getByText('German has three articles.')).toBeTruthy();
    });

    it('renders examples', () => {
      render(<GrammarPage level="A1" topic={topic} onNavigate={onNavigate} />);
      expect(screen.getByText(/der Hund/)).toBeTruthy();
      expect(screen.getByText(/il cane/)).toBeTruthy();
    });

    it('shows exercises section', () => {
      render(<GrammarPage level="A1" topic={topic} onNavigate={onNavigate} />);
      expect(screen.getByText(/Exercises/)).toBeTruthy();
      expect(screen.getByText('What is "the dog"?')).toBeTruthy();
    });

    it('toggles answer visibility', () => {
      render(<GrammarPage level="A1" topic={topic} onNavigate={onNavigate} />);
      const showButtons = screen.getAllByText(/Show answer/);
      fireEvent.click(showButtons[0]);
      expect(screen.getByText('Hund is masculine')).toBeTruthy();
    });
  });
});
