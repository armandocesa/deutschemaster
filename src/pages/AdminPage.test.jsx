import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPage from './AdminPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', t: (key) => key }),
}));

vi.mock('../utils/analytics', () => ({
  getAnalyticsSummary: vi.fn(() => Promise.resolve(null)),
  getMostVisitedPages: vi.fn(() => Promise.resolve([])),
  getExerciseCompletionRates: vi.fn(() => Promise.resolve({})),
  getActiveSessionsCount: vi.fn(() => Promise.resolve(0)),
}));

describe('AdminPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
  });

  it('shows access denied for non-admin', () => {
    const { container } = render(<AdminPage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('admin.accessRequired');
  });

  it('renders without crashing', () => {
    const { container } = render(<AdminPage onNavigate={onNavigate} />);
    expect(container).toBeTruthy();
  });
});
