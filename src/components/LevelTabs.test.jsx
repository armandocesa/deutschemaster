import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevelTabs from './LevelTabs';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));

vi.mock('../utils/constants', () => ({
  LEVEL_COLORS: {
    A1: { bg: '#10b981' }, A2: { bg: '#3b82f6' },
    B1: { bg: '#8b5cf6' }, B2: { bg: '#f59e0b' },
    C1: { bg: '#ef4444' }, C2: { bg: '#dc2626' },
  },
}));

vi.mock('../hooks/useLevelAccess', () => ({
  useLevelAccess: () => ({
    canAccessLevel: () => true,
    requiresAuth: () => false,
  }),
}));

vi.mock('./LevelAccessModal', () => ({
  default: () => null,
}));

describe('LevelTabs', () => {
  let onLevelChange, onNavigate;

  beforeEach(() => {
    onLevelChange = vi.fn();
    onNavigate = vi.fn();
  });

  it('renders all 6 level buttons', () => {
    render(<LevelTabs currentLevel="A1" onLevelChange={onLevelChange} onNavigate={onNavigate} />);
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(lvl => {
      expect(screen.getByText(lvl)).toBeTruthy();
    });
  });

  it('marks current level as active', () => {
    render(<LevelTabs currentLevel="B1" onLevelChange={onLevelChange} onNavigate={onNavigate} />);
    const b1Btn = screen.getByText('B1');
    expect(b1Btn.className).toContain('active');
  });

  it('calls onLevelChange on click', () => {
    render(<LevelTabs currentLevel="A1" onLevelChange={onLevelChange} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('B2'));
    expect(onLevelChange).toHaveBeenCalledWith('B2');
  });

  it('has level-tabs container', () => {
    const { container } = render(<LevelTabs currentLevel="A1" onLevelChange={onLevelChange} onNavigate={onNavigate} />);
    expect(container.querySelector('.level-tabs')).toBeTruthy();
  });
});
