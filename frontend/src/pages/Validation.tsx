import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ValidationResultsResponse } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Cpu,
  BarChart2,
  Info,
  Sliders,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const Validation: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: valData, isLoading } = useQuery<ValidationResultsResponse>({
    queryKey: ['validation'],
    queryFn: api.getValidationResults,
  });

  const rerunMutation = useMutation({
    mutationFn: api.runValidation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation'] });
    },
  });

  // Prepare comparison chart data: Hour-Aware vs Flow-Only vs Daily Rule
  const comparisonData = valData?.primary_results.map((r, idx) => {
    const abl = valData.ablation_flow_only[idx];
    return {
      building: r.building_name,
      'Hour-Aware Alert (Ours)': r.alert_catch_pct,
      'Flow-Only (Ablation)': abl?.catch_pct || 0,
      'Daily-Total IQR Rule': r.daily_rule_pct,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Prototype Testing & Empirical Results
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            {valData?.caption || 'Simulated meter data, 20 random seeds (60 leak nights per building), tuned by the author.'}
          </p>
        </div>

        <button
          onClick={() => rerunMutation.mutate()}
          disabled={rerunMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-hairline hover:border-primary text-ink text-xs font-semibold shadow-sm transition self-start"
        >
          <RotateCw className={`w-4 h-4 text-primary ${rerunMutation.isPending ? 'animate-spin' : ''}`} />
          {rerunMutation.isPending ? 'Executing Experiment...' : 'Re-Run 20-Seed Experiment'}
        </button>
      </div>

      {/* Methodology Summary Card */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
        <h2 className="text-base font-bold text-ink font-heading flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <span>Evaluation Methodology</span>
        </h2>
        <p className="text-xs text-ink-muted leading-relaxed">
          To test detection reliability without real hardware, <strong>35 days</strong> of 15-minute readings were simulated across <strong>20 random seeds</strong> (0–19). An overnight leak (+1,000 L/h for hostel; +600 L/h for canteen and academic block) was injected during <strong>02:00–04:00 AM on 3 nights</strong> (days 30, 31, 32), yielding <strong>60 ground-truth leak nights</strong> and <strong>80 normal test days</strong> per building. Models were trained strictly on days 0–27.
        </p>
      </div>

      {/* Primary Performance Table */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink font-heading">
            Detection Accuracy by Building (Hour-Aware Isolation Forest)
          </h3>
          <span className="text-[11px] font-semibold text-ink-muted">
            Alert Tier = 2+ Consecutive Flagged Hours
          </span>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={4} height="h-10" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                <tr>
                  <th className="py-2.5 px-3">Building</th>
                  <th className="py-2.5 px-3">Leak Size</th>
                  <th className="py-2.5 px-3">Alert Caught</th>
                  <th className="py-2.5 px-3">False Alert Days</th>
                  <th className="py-2.5 px-3">Watch Tier Recall</th>
                  <th className="py-2.5 px-3">False Watch Days</th>
                  <th className="py-2.5 px-3 text-right">Daily IQR Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {valData?.primary_results.map((r) => (
                  <tr key={r.building_id} className="hover:bg-sky-50/50">
                    <td className="py-3 px-3 font-semibold text-ink">{r.building_name}</td>
                    <td className="py-3 px-3 tabular-nums font-mono">+{r.leak_rate_l_h} L/h</td>
                    <td className="py-3 px-3 font-bold text-normal tabular-nums">
                      {r.alert_caught} / {r.total_leak_nights} ({r.alert_catch_pct}%)
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold text-ink-muted">
                      {r.false_alert_days} / {r.total_normal_days} ({r.false_alert_pct}%)
                    </td>
                    <td className="py-3 px-3 tabular-nums text-primary font-medium">
                      {r.watch_caught} / {r.total_leak_nights} ({r.watch_catch_pct}%)
                    </td>
                    <td className="py-3 px-3 tabular-nums text-watch">
                      {r.false_watch_days} / {r.total_normal_days} ({r.false_watch_pct}%)
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-alert">
                      {r.daily_rule_caught} / {r.total_leak_nights} (0.0%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Model vs Ablation Comparison Chart */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
        <div>
          <h3 className="text-base font-bold text-ink font-heading">
            Ablation Study: Detection Catch Rate (%) Across Architectures
          </h3>
          <p className="text-xs text-ink-muted">
            Removing hour-of-day features (<code className="font-mono">rel</code> and <code className="font-mono">hour</code>) causes detection to collapse to near zero because night leaks blend into normal daytime consumption peaks.
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={5} height="h-8" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                <XAxis dataKey="building" stroke="#4F6B78" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#4F6B78" fontSize={11} unit="%" />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Catch Rate']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Hour-Aware Alert (Ours)" fill="#0D9488" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Flow-Only (Ablation)" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Daily-Total IQR Rule" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Sensitivity Analysis Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leak Magnitude Sensitivity */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
          <h3 className="text-sm font-bold text-ink font-heading flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-primary" />
            <span>Sensitivity: Leak Magnitude (Hostel Block A)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                <tr>
                  <th className="py-2 px-3">Leak Size</th>
                  <th className="py-2 px-3">Caught / Total</th>
                  <th className="py-2 px-3">Catch %</th>
                  <th className="py-2 px-3 text-right">False Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {valData?.leak_size_sensitivity.map((s) => (
                  <tr key={s.leak_l_per_hour} className="hover:bg-sky-50/50">
                    <td className="py-2 px-3 font-semibold text-ink">+{s.leak_l_per_hour} L/h</td>
                    <td className="py-2 px-3 tabular-nums">{s.caught} / {s.total_nights}</td>
                    <td className="py-2 px-3 font-bold text-primary tabular-nums">{s.catch_pct}%</td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink-muted">{s.false_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Training Window Sensitivity */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
          <h3 className="text-sm font-bold text-ink font-heading flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>Sensitivity: Training Window Duration</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                <tr>
                  <th className="py-2 px-3">Train Days</th>
                  <th className="py-2 px-3">Caught / Total</th>
                  <th className="py-2 px-3">Catch %</th>
                  <th className="py-2 px-3 text-right">False Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {valData?.training_window_sensitivity.map((w) => (
                  <tr key={w.train_days} className="hover:bg-sky-50/50">
                    <td className="py-2 px-3 font-semibold text-ink">{w.train_days} Days</td>
                    <td className="py-2 px-3 tabular-nums">{w.caught} / {w.total_nights}</td>
                    <td className="py-2 px-3 font-bold text-primary tabular-nums">{w.catch_pct}%</td>
                    <td className="py-2 px-3 text-right tabular-nums text-ink-muted">{w.false_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Honest Weaknesses & Limitations Callout Box */}
      <div className="bg-sky-50 rounded-3xl p-6 border border-hairline space-y-3">
        <div className="flex items-center gap-2 text-ink font-heading font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-watch" />
          <span>Honest Weaknesses Observed in Simulation</span>
        </div>
        <ul className="text-xs text-ink space-y-1.5 list-disc list-inside leading-relaxed">
          {valData?.honest_weaknesses.map((w, idx) => (
            <li key={idx}>{w}</li>
          ))}
        </ul>
        <p className="text-[11px] text-ink-muted pt-2 border-t border-hairline">
          Note: These results represent simulation experiments tuned by the student author. Validating these catch rates with real pulse-meter hardware on the KIET campus is the primary next milestone.
        </p>
      </div>
    </div>
  );
};
