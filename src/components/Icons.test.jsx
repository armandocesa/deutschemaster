import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Icons from './Icons';

describe('Icons', () => {
  it('exports all expected icon components', () => {
    const expectedIcons = ['Book', 'Grammar', 'Verb', 'Quiz', 'Home', 'Back', 'Check', 'X', 'Search',
      'Star', 'StarFilled', 'Volume', 'ChevronRight', 'Practice', 'Eye', 'EyeOff',
      'Reading', 'Lessons', 'Profile', 'Flashcard', 'Writing', 'Listening',
      'Fire', 'Trophy', 'Target', 'Pen', 'Brain', 'Edit', 'Repeat'];
    expectedIcons.forEach(name => {
      expect(typeof Icons[name]).toBe('function');
    });
  });

  it('renders SVG elements', () => {
    const { container } = render(<Icons.Home />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('renders Book icon with correct viewBox', () => {
    const { container } = render(<Icons.Book />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('renders Search icon with size 20', () => {
    const { container } = render(<Icons.Search />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('20');
  });

  it('renders StarFilled with fill=currentColor', () => {
    const { container } = render(<Icons.StarFilled />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('fill')).toBe('currentColor');
  });
});
