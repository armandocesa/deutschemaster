import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PathsPage from './PathsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key,
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({}),
}));

vi.mock('../utils/cloudSync', () => ({ saveAndSync: vi.fn() }));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981' }, A2: { bg: '#3b82f6' },
    B1: { bg: '#8b5cf6' }, B2: { bg: '#f59e0b' },
    C1: { bg: '#ef4444' }, C2: { bg: '#dc2626' },
  },
}));

describe('PathsPage', () => {
  let onNavigate;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
  });

  it('renders title', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    expect(screen.getByText('paths.title')).toBeTruthy();
  });

  it('shows subtitle', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    expect(screen.getByText('paths.subtitle')).toBeTruthy();
  });

  it('shows all 6 level tabs', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    expect(screen.getByText('A1')).toBeTruthy();
    expect(screen.getByText('A2')).toBeTruthy();
    expect(screen.getByText('B1')).toBeTruthy();
    expect(screen.getByText('B2')).toBeTruthy();
    expect(screen.getByText('C1')).toBeTruthy();
    expect(screen.getByText('C2')).toBeTruthy();
  });

  it('shows default path name Grundstufe I', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    expect(screen.getByText('Grundstufe I')).toBeTruthy();
  });

  it('shows stage names', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    expect(screen.getByText('paths.a1_stage1')).toBeTruthy();
    expect(screen.getByText('paths.a1_stage2')).toBeTruthy();
  });

  it('shows progress counters', () => {
    const { container } = render(<PathsPage onNavigate={onNavigate} />);
    // 0/18 for A1 (4 stages, total activities)
    expect(container.textContent).toContain('0/');
  });

  it('switches path on tab click', () => {
    render(<PathsPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('B1'));
    expect(screen.getByText('Mittelstufe I')).toBeTruthy();
  });

  it('shows 0% for all tabs initially', () => {
    const { container } = render(<PathsPage onNavigate={onNavigate} />);
    expect(container.querySelectorAll('.paths-tab-percent').length).toBe(6);
  });
});
