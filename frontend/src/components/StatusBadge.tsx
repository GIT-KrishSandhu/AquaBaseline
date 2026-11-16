import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Normal' | 'Watch' | 'Alert' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1 text-sm gap-1.5';
  const iconSize = isSm ? 'w-3 h-3' : 'w-4 h-4';

  if (status === 'Alert') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-alert-soft text-alert border border-alert/30 ${sizeClasses}`}>
        <AlertCircle className={iconSize} />
        Alert
      </span>
    );
  }

  if (status === 'Watch') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-watch-soft text-watch border border-watch/30 ${sizeClasses}`}>
        <AlertTriangle className={iconSize} />
        Watch
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-semibold bg-normal-soft text-normal border border-normal/30 ${sizeClasses}`}>
      <CheckCircle2 className={iconSize} />
      Normal
    </span>
  );
};
