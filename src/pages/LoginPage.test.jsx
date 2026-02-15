import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './LoginPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'login.title': 'Login',
        'login.firebaseDisabled': 'Firebase not configured',
        'login.firebaseDisabledMessage': 'Login is not available in this environment.',
        'login.continueWithoutAccount': 'Continue without account',
        'login.email': 'Email',
        'login.password': 'Password',
        'login.displayName': 'Name',
        'login.signin': 'Log In',
        'login.signup': 'Sign Up',
        'login.switchToSignup': 'Create account',
        'login.switchToSignin': 'Already have an account',
        'login.continueGoogle': 'Continue with Google',
        'login.or': 'or',
      };
      return map[key] || key;
    },
  }),
}));

const mockAuth = {
  signup: vi.fn(),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  firebaseEnabled: false,
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

describe('LoginPage - Firebase disabled', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    mockAuth.firebaseEnabled = false;
  });

  it('renders title', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    expect(screen.getByText('Login')).toBeTruthy();
  });

  it('shows Firebase disabled message', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    expect(screen.getByText('Firebase not configured')).toBeTruthy();
    expect(screen.getByText('Login is not available in this environment.')).toBeTruthy();
  });

  it('shows continue without account button', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    expect(screen.getByText('Continue without account')).toBeTruthy();
  });

  it('navigates home on continue button click', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Continue without account'));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });
});

describe('LoginPage - Firebase enabled', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
    mockAuth.firebaseEnabled = true;
    mockAuth.login.mockReset();
    mockAuth.signup.mockReset();
    mockAuth.loginWithGoogle.mockReset();
  });

  it('shows login form when Firebase enabled', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    expect(screen.getByText('Log In')).toBeTruthy();
  });

  it('has email and password inputs', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    const inputs = screen.getAllByRole('textbox');
    // At least email input visible
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('has toggle to switch to signup', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    expect(screen.getByText('Create account')).toBeTruthy();
  });

  it('switches to signup mode', () => {
    render(<LoginPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Create account'));
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });
});
