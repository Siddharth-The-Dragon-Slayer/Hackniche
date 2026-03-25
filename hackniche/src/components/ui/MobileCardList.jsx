'use client';

/**
 * MobileCardList — explicit mobile-only card rendering
 * Used when you want full control over mobile layout
 */
export default function MobileCardList({ data = [], keyField = 'id', renderCard }) {
  if (!data.length) return null;
  return (
    <div className="mobile-card-list">
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.map((row, i) => (
          <div key={row[keyField] ?? i} className="mobile-card-item">
            {renderCard(row, i)}
          </div>
        ))}
      </div>
    </div>
  );
}
