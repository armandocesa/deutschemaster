import React from 'react';

// Reusable skeleton loading cards
export function SkeletonCard({ height = '120px', count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '0' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height, borderRadius: 'var(--radius)' }} />
      ))}
    </div>
  );
}

// Full page skeleton with title + cards
export function PageSkeleton({ title = true, cards = 6, cardHeight = '120px' }) {
  return (
    <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease' }}>
      {title && (
        <>
          <div className="skeleton" style={{ width: '200px', height: '28px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '300px', height: '16px', marginBottom: '24px' }} />
        </>
      )}
      <SkeletonCard count={cards} height={cardHeight} />
    </div>
  );
}

export default PageSkeleton;
