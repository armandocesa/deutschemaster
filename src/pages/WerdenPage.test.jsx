import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WerdenPage from './WerdenPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key,
  }),
}));

describe('WerdenPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    window.speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };
  });

  it('renders without crashing', () => {
    const { container } = render(<WerdenPage onNavigate={onNavigate} />);
    expect(container).toBeTruthy();
  });

  it('renders page title', () => {
    render(<WerdenPage onNavigate={onNavigate} />);
    expect(screen.getAllByText('werden.title').length).toBeGreaterThanOrEqual(1);
  });

  it('shows overview tab by default', () => {
    const { container } = render(<WerdenPage onNavigate={onNavigate} />);
    // Should have tab navigation
    expect(container.textContent).toContain('werden.overview');
  });

  it('has navigation tabs', () => {
    const { container } = render(<WerdenPage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('werden.futur');
    expect(container.textContent).toContain('werden.passiv');
  });
});
