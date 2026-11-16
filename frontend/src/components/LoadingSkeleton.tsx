import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 4,
  height = 'h-6',
}) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-sky-100 rounded-xl w-full ${height}`}
          style={{ width: `${Math.max(60, 100 - i * 12)}%` }}
        />
      ))}
    </div>
  );
};
