import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import StoriesPage from './StoriesPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'stories.title': 'Stories',
        'stories.interactive': 'Interactive Stories',
        'stories.stories': 'stories',
        'stories.noStories': 'No stories available',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({
    canAccessLevel: () => true,
    requiresAuth: () => false,
    isAuthenticated: false,
  }),
}));

vi.mock('../utils/cloudSync', () => ({ saveAndSync: vi.fn() }));
vi.mock('../utils/gamification', () => ({ addXP: vi.fn() }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

vi.mock('../components/LevelTabs', () => ({
  default: ({ currentLevel, onLevelChange }) => (
    <div data-testid="level-tabs">
      {['A1', 'A2', 'B1'].map(l => (
        <button key={l} onClick={() => onLevelChange(l)}>{l}</button>
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

// Mock fetch to return stories data
const mockStories = {
  levels: {
    A1: {
      stories: [
        { id: 's1', title: 'Im Café', titleIt: 'Al bar', emoji: '☕', characters: ['Anna', 'Tom'], lines: [{ speaker: 'narrator', text: 'Es ist Montag.', translation: "È lunedì." }] },
        { id: 's2', title: 'Am Bahnhof', titleIt: 'Alla stazione', emoji: '🚂', characters: ['Max'], lines: [{ speaker: 'narrator', text: 'Max steht am Bahnhof.', translation: 'Max è alla stazione.' }] },
      ],
    },
  },
};

describe('StoriesPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockStories) }));
  });

  it('shows loading skeleton initially', () => {
    // Don't resolve fetch immediately
    global.fetch = vi.fn(() => new Promise(() => {}));
    const { container } = render(<StoriesPage onNavigate={onNavigate} />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });

  it('renders title after loading', async () => {
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Interactive Stories')).toBeTruthy();
    });
  });

  it('renders story list after loading', async () => {
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Im Café')).toBeTruthy();
      expect(screen.getByText('Am Bahnhof')).toBeTruthy();
    });
  });

  it('shows story characters', async () => {
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('Anna, Tom')).toBeTruthy();
    });
  });

  it('shows story count', async () => {
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText(/2 stories/)).toBeTruthy();
    });
  });

  it('renders level tabs', async () => {
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByTestId('level-tabs')).toBeTruthy();
    });
  });

  it('shows empty state when no stories', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ levels: { A1: { stories: [] } } }) }));
    render(<StoriesPage level="A1" onNavigate={onNavigate} />);
    await waitFor(() => {
      expect(screen.getByText('No stories available')).toBeTruthy();
    });
  });
});
