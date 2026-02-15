import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock all heavy dependencies
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '' }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Navigate: () => null,
}));

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, isAuthenticated: false, firebaseEnabled: false }),
}));

vi.mock('./contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('./contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', t: (key) => key }),
  LanguageProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('./components/Toast', () => ({
  ToastProvider: ({ children }) => <div>{children}</div>,
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock('./components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('./components/BottomNav', () => ({ default: () => <div data-testid="bottom-nav" /> }));
vi.mock('./components/Footer', () => ({ default: () => <div data-testid="footer" /> }));
vi.mock('./utils/analytics', () => ({ trackPageView: vi.fn() }));
vi.mock('./utils/notifications', () => ({
  isEnabled: () => false,
  getReminderTime: () => '20:00',
  scheduleReminder: () => () => {},
}));

// Must import after all mocks
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('contains expected structure', () => {
    const { container } = render(<App />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
