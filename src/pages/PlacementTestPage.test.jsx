import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlacementTestPage from './PlacementTestPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'placement.title': 'Find Your Level',
        'placement.discover': 'Discover your German level',
        'placement.how': 'How does it work?',
        'placement.questions': '30 questions total',
        'placement.progressive': 'Progressive difficulty',
        'placement.stop': 'Automatic early stopping',
        'placement.result': 'Get your level',
        'placement.saved': 'Results saved',
        'placement.start': 'Start Test',
        'placement.back': 'Back',
        'placement.loading': 'Loading...',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', text: '#fff', light: '#d1fae5' },
    A2: { bg: '#3b82f6', text: '#fff', light: '#dbeafe' },
    B1: { bg: '#8b5cf6', text: '#fff', light: '#ede9fe' },
    B2: { bg: '#f59e0b', text: '#fff', light: '#fef3c7' },
    C1: { bg: '#ef4444', text: '#fff', light: '#fee2e2' },
    C2: { bg: '#dc2626', text: '#fff', light: '#fecaca' },
  },
  getLevelName: (lvl) => ({ A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery' }[lvl] || lvl),
}));

vi.mock('../utils/cloudSync', () => ({ saveAndSync: vi.fn() }));
vi.mock('../utils/gamification', () => ({ recordActivity: vi.fn() }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('PlacementTestPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            questions: [
              {
                level: 'A1',
                type: 'vocabulary',
                question: 'What is the German word for "hello"?',
                options: ['Hallo', 'Auf Wiedersehen', 'Danke', 'Bitte'],
                correctAnswer: 0,
                explanation: 'Hallo means hello',
              },
            ],
          }),
      })
    );
  });

  it('renders welcome title', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('Find Your Level')).toBeTruthy();
  });

  it('shows description text', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('Discover your German level')).toBeTruthy();
  });

  it('shows how it works section', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('How does it work?')).toBeTruthy();
  });

  it('displays info box with features', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('30 questions total')).toBeTruthy();
    expect(screen.getByText('Progressive difficulty')).toBeTruthy();
    expect(screen.getByText('Automatic early stopping')).toBeTruthy();
  });

  it('has start button before test begins', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('Start Test')).toBeTruthy();
  });

  it('has back button on welcome screen', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(screen.getByText('Back')).toBeTruthy();
  });

  it('shows welcome icon', () => {
    render(<PlacementTestPage onNavigate={onNavigate} />);
    const { container } = render(<PlacementTestPage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('📍');
  });
});
