import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonsPage from './LessonsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'lessons.progress': 'Progress',
        'lessons.completed': 'completed',
        'lessons.passive': 'Passive',
        'lessons.active': 'Active',
        'lessons.title': 'Lesson',
        'lessons.listeningComprehension': 'Listening Comprehension',
        'lessons.activeProduction': 'Active Production',
        'lessons.comingSoon': 'coming soon',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    LESSONS_DATA: [
      { id: 1, number: 1, title: 'Greetings', phase: 'passiva', tag: 'A1', isReview: false, dialogue: [] },
      { id: 2, number: 2, title: 'Introductions', phase: 'passiva', tag: 'A1', isReview: false, dialogue: [] },
      { id: 3, number: 3, title: 'Numbers', phase: 'passiva', tag: 'A1', isReview: false, dialogue: [] },
      { id: 4, number: 50, title: 'Speaking Practice', phase: 'attiva', tag: 'A2', isReview: false, dialogue: [] },
      { id: 5, number: 51, title: 'Conversation', phase: 'attiva', tag: 'A2', isReview: true, dialogue: [] },
    ],
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

describe('LessonsPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders page title', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getByText('Progress')).toBeTruthy();
  });

  it('shows completed count', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getByText(/0\/5 completed/)).toBeTruthy();
  });

  it('renders passive phase group', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getByText('Passive')).toBeTruthy();
    expect(screen.getByText(/Listening Comprehension/)).toBeTruthy();
  });

  it('renders active phase group', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getAllByText('Active').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Active Production/)).toBeTruthy();
  });

  it('renders lesson numbers', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('renders lesson titles', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getByText('Greetings')).toBeTruthy();
    expect(screen.getByText('Introductions')).toBeTruthy();
    expect(screen.getByText('Numbers')).toBeTruthy();
    expect(screen.getByText('Speaking Practice')).toBeTruthy();
    expect(screen.getByText('Conversation')).toBeTruthy();
  });

  it('shows phase and tag badges for lessons', () => {
    render(<LessonsPage onNavigate={onNavigate} />);
    expect(screen.getAllByText(/A1/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/A2/).length).toBeGreaterThanOrEqual(1);
  });
});
