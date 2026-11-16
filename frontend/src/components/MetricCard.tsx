import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  isAssumed?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  delta,
  deltaLabel = 'vs baseline',
  subtext,
  icon,
  badge,
  isAssumed = false,
}) => {
  return (
    <div className="bg-surface rounded-2xl p-5 border border-hairline shadow-card hover:shadow-card-hover transition duration-200 relative flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {label} {isAssumed && <span className="text-cyan text-[10px] normal-case tracking-normal">(assumed)</span>}
        </span>
        {icon && <div className="text-primary p-1.5 bg-primary-soft rounded-lg">{icon}</div>}
        {badge && <div>{badge}</div>}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-ink tabular-nums tracking-tight">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-ink-muted">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {delta !== undefined ? (
          <div className="flex items-center gap-1 font-semibold">
            {delta > 0 ? (
              <span className="flex items-center text-alert gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{delta}%
              </span>
            ) : delta < 0 ? (
              <span className="flex items-center text-normal gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {delta}%
              </span>
            ) : (
              <span className="flex items-center text-ink-muted gap-0.5">
                <Minus className="w-3.5 h-3.5" /> 0%
              </span>
            )}
            <span className="text-ink-muted font-normal">{deltaLabel}</span>
          </div>
        ) : subtext ? (
          <span className="text-ink-muted">{subtext}</span>
        ) : null}
      </div>
    </div>
  );
};
