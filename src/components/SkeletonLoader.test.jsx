import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PageSkeleton, { SkeletonCard } from './SkeletonLoader';

describe('SkeletonLoader', () => {
  describe('SkeletonCard', () => {
    it('renders default 3 skeleton items', () => {
      const { container } = render(<SkeletonCard />);
      expect(container.querySelectorAll('.skeleton').length).toBe(3);
    });

    it('renders custom count', () => {
      const { container } = render(<SkeletonCard count={5} />);
      expect(container.querySelectorAll('.skeleton').length).toBe(5);
    });

    it('applies custom height', () => {
      const { container } = render(<SkeletonCard height="200px" count={1} />);
      const skeleton = container.querySelector('.skeleton');
      expect(skeleton.style.height).toBe('200px');
    });
  });

  describe('PageSkeleton', () => {
    it('renders title skeleton by default', () => {
      const { container } = render(<PageSkeleton />);
      expect(container.querySelector('.skeleton-title')).toBeTruthy();
      expect(container.querySelector('.skeleton-subtitle')).toBeTruthy();
    });

    it('hides title when title=false', () => {
      const { container } = render(<PageSkeleton title={false} />);
      expect(container.querySelector('.skeleton-title')).toBeNull();
    });

    it('renders default 6 cards', () => {
      const { container } = render(<PageSkeleton />);
      expect(container.querySelectorAll('.skeleton').length).toBe(6);
    });
  });
});
