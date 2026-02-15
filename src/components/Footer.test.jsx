import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const map = { 'footer.title': 'DeutschMaster', 'footer.words': 'words', 'footer.topics': 'topics', 'footer.verbs': 'verbs' };
      return map[key] || key;
    },
  }),
}));

describe('Footer', () => {
  it('renders footer element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).toBeTruthy();
  });

  it('shows app title', () => {
    render(<Footer />);
    expect(screen.getByText(/DeutschMaster/)).toBeTruthy();
  });

  it('shows stats', () => {
    const { container } = render(<Footer />);
    expect(container.textContent).toContain('14.315');
    expect(container.textContent).toContain('177');
    expect(container.textContent).toContain('414');
  });
});
