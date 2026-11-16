import React from 'react';
import { Info } from 'lucide-react';

export const SimulatedDataChip: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-soft border border-cyan/30 text-ink text-xs font-medium shadow-sm transition hover:bg-cyan-100" title="All meter streams, baselines, and savings are simulated or assumed for this prototype.">
      <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
      <span>Simulated Data Prototype</span>
      <span className="hidden sm:inline text-ink-muted">· Assumed Baselines</span>
    </div>
  );
};
