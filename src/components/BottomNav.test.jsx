import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from './BottomNav';

// Mock LanguageContext
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'nav.home': 'Home',
        'nav.paths': 'Paths',
        'nav.lessons': 'Lessons',
        'nav.practice': 'Practice',
        'nav.saved': 'Saved',
      };
      return map[key] || key;
    },
  }),
}));

// Mock Icons
vi.mock('./Icons', () => ({
  default: {
    Home: () => <span data-testid="icon-home">H</span>,
    Target: () => <span data-testid="icon-target">T</span>,
    Lessons: () => <span data-testid="icon-lessons">L</span>,
    Practice: () => <span data-testid="icon-practice">P</span>,
    Star: () => <span data-testid="icon-star">S</span>,
  },
}));

describe('BottomNav', () => {
  it('renders all 5 navigation items', () => {
    render(<BottomNav currentPage="home" onNavigate={() => {}} />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Paths')).toBeTruthy();
    expect(screen.getByText('Lessons')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('Saved')).toBeTruthy();
  });

  it('has aria-label="Mobile navigation"', () => {
    render(<BottomNav currentPage="home" onNavigate={() => {}} />);
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Mobile navigation');
  });

  it('marks the active page with aria-current="page"', () => {
    render(<BottomNav currentPage="home" onNavigate={() => {}} />);
    const homeBtn = screen.getByText('Home').closest('button');
    expect(homeBtn.getAttribute('aria-current')).toBe('page');
    const pathsBtn = screen.getByText('Paths').closest('button');
    expect(pathsBtn.getAttribute('aria-current')).toBeNull();
  });

  it('applies active class to current page button', () => {
    render(<BottomNav currentPage="paths" onNavigate={() => {}} />);
    const pathsBtn = screen.getByText('Paths').closest('button');
    expect(pathsBtn.classList.contains('active')).toBe(true);
    const homeBtn = screen.getByText('Home').closest('button');
    expect(homeBtn.classList.contains('active')).toBe(false);
  });

  it('calls onNavigate with correct page when clicked', () => {
    const onNavigate = vi.fn();
    render(<BottomNav currentPage="home" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Practice'));
    expect(onNavigate).toHaveBeenCalledWith('practice');
  });

  it('practice is active when on flashcards page', () => {
    render(<BottomNav currentPage="flashcards" onNavigate={() => {}} />);
    const practiceBtn = screen.getByText('Practice').closest('button');
    expect(practiceBtn.classList.contains('active')).toBe(true);
  });
});
