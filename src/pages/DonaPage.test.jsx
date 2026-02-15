import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DonaPage from './DonaPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => key,
  }),
}));

describe('DonaPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    window.open = vi.fn();
  });

  it('renders donation title', () => {
    render(<DonaPage onNavigate={onNavigate} />);
    expect(screen.getByText('dona.title')).toBeTruthy();
  });

  it('shows donation amount buttons', () => {
    const { container } = render(<DonaPage onNavigate={onNavigate} />);
    expect(container.textContent).toContain('€3');
    expect(container.textContent).toContain('€5');
    expect(container.textContent).toContain('€10');
    expect(container.textContent).toContain('€20');
  });

  it('opens PayPal on donation click', () => {
    const { container } = render(<DonaPage onNavigate={onNavigate} />);
    const buttons = container.querySelectorAll('.dona-amount-btn');
    fireEvent.click(buttons[0]); // €3
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('paypal.me'), '_blank');
  });

  it('has custom amount button', () => {
    render(<DonaPage onNavigate={onNavigate} />);
    expect(screen.getByText('dona.customAmount')).toBeTruthy();
  });

  it('shows why donate section', () => {
    render(<DonaPage onNavigate={onNavigate} />);
    expect(screen.getByText('dona.whyDonate')).toBeTruthy();
  });

  it('shows benefit cards', () => {
    render(<DonaPage onNavigate={onNavigate} />);
    expect(screen.getByText('dona.freeContent')).toBeTruthy();
    expect(screen.getByText('dona.noAdvertisements')).toBeTruthy();
    expect(screen.getByText('dona.continuousUpdates')).toBeTruthy();
    expect(screen.getByText('dona.fullPotential')).toBeTruthy();
  });
});
