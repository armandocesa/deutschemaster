import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotFoundPage from './NotFoundPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const map = {
        'notFound.title': 'Page not found',
        'notFound.message': 'The page you are looking for does not exist.',
        'notFound.homeButton': 'Go Home',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('NotFoundPage', () => {
  it('renders 404 code', () => {
    render(<NotFoundPage onNavigate={() => {}} />);
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('renders title and message', () => {
    render(<NotFoundPage onNavigate={() => {}} />);
    expect(screen.getByText('Page not found')).toBeTruthy();
    expect(screen.getByText('The page you are looking for does not exist.')).toBeTruthy();
  });

  it('navigates home on button click', () => {
    const onNavigate = vi.fn();
    render(<NotFoundPage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Go Home'));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });
});
