import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpecialVerbsPage from './SpecialVerbsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'specialVerbs.title': 'Modal Verbs',
        'specialVerbs.subtitle': 'Learn German modal verbs',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({ canAccessLevel: () => true }),
}));

vi.mock('../utils/speech', () => ({ speak: vi.fn() }));
vi.mock('../utils/storage', () => ({
  isDifficultWord: () => false,
  saveDifficultWord: vi.fn(),
  removeDifficultWord: vi.fn(),
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('SpecialVerbsPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
  });

  it('renders title', () => {
    render(<SpecialVerbsPage onNavigate={onNavigate} />);
    expect(screen.getByText('Modal Verbs')).toBeTruthy();
  });

  it('shows modal verbs', () => {
    render(<SpecialVerbsPage onNavigate={onNavigate} />);
    expect(screen.getAllByText(/können/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/müssen/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/wollen/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows Italian translations', () => {
    const { container } = render(<SpecialVerbsPage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('potere');
    expect(container.textContent).toContain('dovere');
    expect(container.textContent).toContain('volere');
  });

  it('renders without crashing', () => {
    const { container } = render(<SpecialVerbsPage onNavigate={onNavigate} />);
    expect(container).toBeTruthy();
  });
});
