import React from 'react';

// Reusable skeleton loading cards
export function SkeletonCard({ height = '120px', count = 3 }) {
  return (
    <div className="skeleton-card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height }} />
      ))}
    </div>
  );
}

// Full page skeleton with title + cards
export function PageSkeleton({ title = true, cards = 6, cardHeight = '120px' }) {
  return (
    <div className="skeleton-page">
      {title && (
        <>
          <div className="skeleton-title" />
          <div className="skeleton-subtitle" />
        </>
      )}
      <SkeletonCard count={cards} height={cardHeight} />
    </div>
  );
}

export default PageSkeleton;
