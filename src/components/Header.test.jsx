import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock contexts
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    t: (key) => {
      const map = {
        'nav.home': 'Home',
        'nav.paths': 'Paths',
        'nav.stories': 'Stories',
        'nav.verbs': 'Verbs',
        'nav.practice': 'Practice',
        'nav.saved': 'Saved',
        'nav.profile': 'Profile',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../utils/gamification', () => ({
  getStreak: () => ({ currentStreak: 5, longestStreak: 10 }),
  getXP: () => ({ totalXP: 1250 }),
}));

vi.mock('./Icons', () => ({
  default: {
    Home: () => <span data-testid="icon-home">H</span>,
    Target: () => <span data-testid="icon-target">T</span>,
    Verb: () => <span data-testid="icon-verb">V</span>,
    Practice: () => <span data-testid="icon-practice">P</span>,
    Star: () => <span data-testid="icon-star">S</span>,
    Profile: () => <span data-testid="icon-profile">Pr</span>,
    Back: () => <span data-testid="icon-back">←</span>,
  },
}));

describe('Header', () => {
  const defaultProps = {
    currentPage: 'home',
    onNavigate: vi.fn(),
    onBack: vi.fn(),
    showBack: false,
    breadcrumbs: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo when showBack is false', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('DeutschMaster')).toBeTruthy();
  });

  it('renders back button when showBack is true', () => {
    render(<Header {...defaultProps} showBack={true} />);
    expect(screen.getByLabelText('Go back')).toBeTruthy();
    expect(screen.queryByText('DeutschMaster')).toBeNull();
  });

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn();
    render(<Header {...defaultProps} showBack={true} onBack={onBack} />);
    fireEvent.click(screen.getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('displays streak count', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('displays XP count', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('1250')).toBeTruthy();
  });

  it('renders all navigation buttons', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Paths')).toBeTruthy();
    expect(screen.getByText('Stories')).toBeTruthy();
    expect(screen.getByText('Verbs')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('marks home as active with aria-current', () => {
    render(<Header {...defaultProps} currentPage="home" />);
    const homeBtn = screen.getByText('Home').closest('button');
    expect(homeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('calls onNavigate when nav button clicked', () => {
    const onNavigate = vi.fn();
    render(<Header {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Practice'));
    expect(onNavigate).toHaveBeenCalledWith('practice');
  });

  it('has main navigation aria-label', () => {
    render(<Header {...defaultProps} />);
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('renders language selector buttons', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByLabelText('Switch to Italian')).toBeTruthy();
    expect(screen.getByLabelText('Switch to English')).toBeTruthy();
  });

  it('renders theme toggle with correct aria-label', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByLabelText('Switch to light mode')).toBeTruthy();
  });

  it('renders breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: 'Home', onClick: vi.fn() },
      { label: 'Grammar', onClick: vi.fn() },
    ];
    render(<Header {...defaultProps} breadcrumbs={breadcrumbs} />);
    expect(screen.getByText('Grammar')).toBeTruthy();
  });

  it('clicking logo navigates to home', () => {
    const onNavigate = vi.fn();
    render(<Header {...defaultProps} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('DeutschMaster'));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });
});
