import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Onboarding from './Onboarding';

// Mock LanguageContext
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key, // Return the key as-is so fallbacks are used
  }),
}));

// Mock Icons
vi.mock('./Icons', () => ({
  default: {
    Home: () => <span>HomeIcon</span>,
    Target: () => <span>TargetIcon</span>,
    Practice: () => <span>PracticeIcon</span>,
    Star: () => <span>StarIcon</span>,
    Profile: () => <span>ProfileIcon</span>,
  },
}));

describe('Onboarding', () => {
  let onNavigate, onComplete;

  beforeEach(() => {
    localStorage.clear();
    onNavigate = vi.fn();
    onComplete = vi.fn();
  });

  it('renders the first step (Welcome)', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    expect(screen.getByText('Welcome to DeutschMaster!')).toBeTruthy();
  });

  it('shows Next and Skip buttons on first step', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    expect(screen.getByText('Next')).toBeTruthy();
    expect(screen.getByText('Skip')).toBeTruthy();
  });

  it('advances to step 2 when Next is clicked', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Find your level')).toBeTruthy();
  });

  it('shows placement test buttons on step 2', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Take placement test')).toBeTruthy();
    expect(screen.getByText('Start from A1')).toBeTruthy();
  });

  it('clicking Take placement test navigates and completes', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next')); // go to step 2
    fireEvent.click(screen.getByText('Take placement test'));
    expect(onComplete).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith('placement-test');
    expect(localStorage.getItem('dm_onboarding_done')).toBe('true');
  });

  it('clicking Start from A1 goes to step 3', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next')); // step 2
    fireEvent.click(screen.getByText('Start from A1')); // skip test → step 3
    expect(screen.getByText('Explore & learn')).toBeTruthy();
  });

  it('shows "Let\'s go!" on the last step', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next')); // step 2
    fireEvent.click(screen.getByText('Start from A1')); // step 3
    fireEvent.click(screen.getByText('Next')); // step 4
    expect(screen.getByText("Let's go!")).toBeTruthy();
  });

  it('completing the last step calls onComplete', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Start from A1'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText("Let's go!"));
    expect(onComplete).toHaveBeenCalled();
    expect(localStorage.getItem('dm_onboarding_done')).toBe('true');
  });

  it('Skip button calls onComplete immediately', () => {
    render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    fireEvent.click(screen.getByText('Skip'));
    expect(onComplete).toHaveBeenCalled();
    expect(localStorage.getItem('dm_onboarding_done')).toBe('true');
  });

  it('renders 4 step dots', () => {
    const { container } = render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    const dots = container.querySelectorAll('.onboarding-dot');
    expect(dots).toHaveLength(4);
  });

  it('first dot is active on first step', () => {
    const { container } = render(<Onboarding onNavigate={onNavigate} onComplete={onComplete} />);
    const dots = container.querySelectorAll('.onboarding-dot');
    expect(dots[0].classList.contains('active')).toBe(true);
    expect(dots[1].classList.contains('active')).toBe(false);
  });
});
