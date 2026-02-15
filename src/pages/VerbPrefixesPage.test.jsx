import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VerbPrefixesPage from './VerbPrefixesPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key,
  }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981', light: '#d1fae5', text: '#065f46' },
    A2: { bg: '#3b82f6', light: '#dbeafe', text: '#1e40af' },
    B1: { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' },
    B2: { bg: '#f59e0b', light: '#fef3c7', text: '#92400e' },
    C1: { bg: '#ef4444', light: '#fee2e2', text: '#991b1b' },
    C2: { bg: '#dc2626', light: '#fee2e2', text: '#991b1b' },
  },
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

const mockData = {
  trennbar: [
    { prefix: 'ab', meaning: 'away', verbs: [{ verb: 'abfahren', meaning: 'to depart', examples: [{ german: 'Der Zug fährt ab.', italian: 'Il treno parte.', level: 'A1' }] }] },
  ],
  untrennbar: [
    { prefix: 'be', meaning: 'makes transitive', verbs: [{ verb: 'besuchen', meaning: 'to visit', examples: [] }] },
  ],
  variabel: [],
};

describe('VerbPrefixesPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) }));
  });

  it('shows loading skeleton initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}));
    const { container } = render(<VerbPrefixesPage onNavigate={onNavigate} />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders title after loading', async () => {
    render(<VerbPrefixesPage onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('verbPrefixes.title')).toBeTruthy();
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<VerbPrefixesPage onNavigate={onNavigate} />);
    expect(container).toBeTruthy();
  });
});
