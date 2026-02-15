import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LevelAccessModal from './LevelAccessModal';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const map = {
        'levelAccess.protected': 'Protected Content',
        'levelAccess.onlyRegistered': 'Only registered users can access',
        'levelAccess.isPrivate': 'content.',
        'levelAccess.signUpFree': 'Sign up for free!',
        'levelAccess.signIn': 'Sign In',
        'levelAccess.cancel': 'Cancel',
        'levelAccess.freeLevel': 'A1 is always free',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('./Icons', () => ({
  default: { X: () => <span data-testid="icon-x">X</span> },
}));

describe('LevelAccessModal', () => {
  let onClose, onLoginClick;

  beforeEach(() => {
    onClose = vi.fn();
    onLoginClick = vi.fn();
  });

  it('returns null when not open', () => {
    const { container } = render(<LevelAccessModal isOpen={false} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders when open', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });

  it('shows level name', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    expect(screen.getByText('B1')).toBeTruthy();
  });

  it('has sign in button', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    expect(screen.getByText('Sign In')).toBeTruthy();
  });

  it('calls onLoginClick on sign in', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    fireEvent.click(screen.getByText('Sign In'));
    expect(onLoginClick).toHaveBeenCalled();
  });

  it('has cancel button', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    const { container } = render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    fireEvent.click(container.querySelector('.modal-overlay'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows free level note', () => {
    render(<LevelAccessModal isOpen={true} level="B1" onClose={onClose} onLoginClick={onLoginClick} />);
    expect(screen.getByText('A1 is always free')).toBeTruthy();
  });
});
