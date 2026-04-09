import './Skeleton.css';

export function SkeletonText({ width = '100%', height = '1rem', style }) {
  return <div className="skeleton skeleton-text" style={{ width, height, ...style }} />;
}

export function SkeletonCircle({ size = 40, style }) {
  return <div className="skeleton skeleton-circle" style={{ width: size, height: size, ...style }} />;
}

export function SkeletonCard({ height = 120, style }) {
  return <div className="skeleton skeleton-card" style={{ height, ...style }} />;
}

export function SkeletonStat({ style }) {
  return (
    <div className="card stat-card skeleton-stat-card" style={style}>
      <SkeletonCircle size={42} />
      <div style={{ flex: 1 }}>
        <SkeletonText width="60px" height="1.5rem" style={{ marginBottom: '0.35rem' }} />
        <SkeletonText width="100px" height="0.8rem" />
      </div>
    </div>
  );
}

export function SkeletonActionCard({ style }) {
  return (
    <div className="card skeleton-action" style={style}>
      <SkeletonCircle size={36} />
      <SkeletonText width="120px" height="0.9rem" />
    </div>
  );
}

export function SkeletonActivity({ count = 3 }) {
  return (
    <div className="skeleton-activity-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-activity-item">
          <SkeletonCircle size={10} />
          <div style={{ flex: 1 }}>
            <SkeletonText width="70%" height="0.9rem" style={{ marginBottom: '0.25rem' }} />
            <SkeletonText width="40%" height="0.7rem" />
          </div>
          <SkeletonText width="50px" height="0.7rem" />
        </div>
      ))}
    </div>
  );
}
