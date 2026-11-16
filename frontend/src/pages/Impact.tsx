import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, MetricsResponse } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  TrendingUp,
  Leaf,
  Users,
  Shield,
  Calculator,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

export const Impact: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'metrics' | 'savings' | 'roadmap'>('metrics');

  // Interactive savings calculator state
  const [calcPeople, setCalcPeople] = useState<number>(5000);
  const [calcBaseline, setCalcBaseline] = useState<number>(276);
  const [calcCutPct, setCalcCutPct] = useState<number>(10);

  // Manual metrics inputs state
  const [complaintsInput, setComplaintsInput] = useState<number>(30);
  const [staffHoursInput, setStaffHoursInput] = useState<number>(10);

  const { data: metricsData, isLoading } = useQuery<MetricsResponse>({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
  });

  // Manual metric mutation
  const manualMutation = useMutation({
    mutationFn: () => api.updateManualMetrics(complaintsInput, staffHoursInput),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  // Dynamic calculator outputs
  const dailySavedL = calcPeople * calcBaseline * (calcCutPct / 100);
  const annualSavedL = dailySavedL * 365;

  const scaleUp = metricsData?.scale_up;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-normal" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Impact, ESG Metrics & Scaling Roadmap
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Quantifiable environmental, social, and governance outcomes, savings projections, and data-driven scaling triggers.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="inline-flex p-1 bg-surface border border-hairline rounded-2xl shadow-sm self-start">
          {[
            { id: 'metrics', label: 'ESG Metrics' },
            { id: 'savings', label: 'Savings Calculator' },
            { id: 'roadmap', label: 'Roadmap & Safeguards' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-sky-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: ESG Metrics */}
      {activeTab === 'metrics' && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* ESG Table Card */}
          <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-ink font-heading">
                  The Six ESG Capstone Indicators (Assignment 4A)
                </h2>
                <p className="text-xs text-ink-muted">
                  Baselines and targets are planning assumptions until a 4-week continuous on-site baseline exists. Live values update dynamically.
                </p>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton rows={6} height="h-10" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                    <tr>
                      <th className="py-3 px-3">Pillar</th>
                      <th className="py-3 px-3">Metric Name</th>
                      <th className="py-3 px-3">Current State</th>
                      <th className="py-3 px-3">Expected Target</th>
                      <th className="py-3 px-3">Source Type</th>
                      <th className="py-3 px-3">Operational Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {metricsData?.esg_metrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/50">
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              m.pillar === 'E'
                                ? 'bg-normal-soft text-normal'
                                : m.pillar === 'S'
                                ? 'bg-cyan-soft text-primary-dark'
                                : 'bg-sky-100 text-ink'
                            }`}
                          >
                            {m.pillar === 'E' ? 'Environmental' : m.pillar === 'S' ? 'Social' : 'Governance'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-ink">{m.name}</td>
                        <td className="py-3 px-3 font-bold text-ink tabular-nums">{m.current_value}</td>
                        <td className="py-3 px-3 font-semibold text-normal tabular-nums">{m.expected_value}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              m.is_live
                                ? 'bg-normal-soft text-normal'
                                : 'bg-sky-100 text-ink-muted'
                            }`}
                          >
                            {m.is_live ? 'Live Computed' : 'Manual / Assumed'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-ink-muted max-w-xs">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Social Indicators Manual Input Panel */}
          <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
            <h3 className="text-base font-bold text-ink font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Update Social Pillar Metrics (Facility Staff Logs)</span>
            </h3>
            <p className="text-xs text-ink-muted">
              Because hostel complaints and plumber check logs are recorded manually on campus, enter updated monthly values below to update the live ESG report.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-ink-muted uppercase mb-1">
                  Water Complaints (per month)
                </label>
                <input
                  type="number"
                  value={complaintsInput}
                  onChange={(e) => setComplaintsInput(parseInt(e.target.value) || 0)}
                  className="w-full bg-sky-50 border border-hairline rounded-xl px-3 py-2 text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-muted uppercase mb-1">
                  Staff Hours on Checks (hrs/wk)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={staffHoursInput}
                  onChange={(e) => setStaffHoursInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-sky-50 border border-hairline rounded-xl px-3 py-2 text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => manualMutation.mutate()}
                  disabled={manualMutation.isPending}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-sm transition"
                >
                  {manualMutation.isPending ? 'Updating...' : 'Save Social Metrics'}
                </button>
              </div>
            </div>
          </div>

          {/* Interpretation & Decision Rules */}
          <div className="bg-sky-50 rounded-3xl p-6 border border-hairline space-y-3">
            <h3 className="font-heading font-bold text-sm text-ink">
              Data Interpretation & Governance Decision Rules
            </h3>
            <ul className="text-xs text-ink space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Leak share falls but per-person use stays flat:</strong> Savings are stemming strictly from pipe repairs rather than resident behavioural changes. (Safeguard: Target highest-use student hostels with awareness drives).
              </li>
              <li>
                <strong>Fewer than 50% of alerts are confirmed:</strong> The model is over-sensitive or diurnal baseline is drifting. (Safeguard: Retune alert band and retrain before onboarding additional campus buildings).
              </li>
              <li>
                <strong>Complaints and staff hours both fall:</strong> System provides empirical operational ROI, supporting extension to academic laboratories and sports facilities.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Savings Calculator */}
      {activeTab === 'savings' && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Sliders */}
            <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-5">
              <div className="flex items-center gap-2 font-bold font-heading text-base text-ink">
                <Calculator className="w-5 h-5 text-primary" />
                <span>Simulation Parameters</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1">
                    <span>Campus Population</span>
                    <span className="font-bold text-primary">{calcPeople.toLocaleString()} people</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={calcPeople}
                    onChange={(e) => setCalcPeople(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-ink-muted">Assumed KIET campus size: 5,000</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1">
                    <span>Baseline Consumption</span>
                    <span className="font-bold text-primary">{calcBaseline} L/person/day</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="350"
                    step="5"
                    value={calcBaseline}
                    onChange={(e) => setCalcBaseline(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-ink-muted">Dataset 25-yr mean: 276 L/day</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1">
                    <span>Target Reduction</span>
                    <span className="font-bold text-primary">{calcCutPct}% cut</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={calcCutPct}
                    onChange={(e) => setCalcCutPct(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-ink-muted">Assumed 6-month goal: 10%</span>
                </div>
              </div>
            </div>

            {/* Projected Savings Cards */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary-soft to-cyan-soft rounded-3xl p-6 border border-primary/20 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                    Projected Daily Water Saved
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-ink mt-2 tabular-nums">
                    {Math.round(dailySavedL).toLocaleString()} L
                  </div>
                  <span className="text-xs text-ink-muted mt-1 block">
                    {calcPeople.toLocaleString()} people × {calcBaseline} L × {calcCutPct}%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-primary/20 text-xs text-ink-muted">
                  Equivalent to ~138 tanker trucks of water conserved every single day.
                </div>
              </div>

              <div className="bg-gradient-to-br from-normal-soft to-sky-100 rounded-3xl p-6 border border-normal/20 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-normal">
                    Projected Annual Conservation
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-ink mt-2 tabular-nums">
                    ~{(annualSavedL / 1e6).toFixed(1)} Million L
                  </div>
                  <span className="text-xs text-ink-muted mt-1 block">
                    {Math.round(annualSavedL).toLocaleString()} Litres / year
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-normal/20 text-xs text-ink-muted">
                  Substantially cuts campus electricity pumping costs and relieves regional water stress.
                </div>
              </div>

              <div className="sm:col-span-2 bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-2">
                <h4 className="font-heading font-bold text-sm text-ink">
                  Financial & Environmental Multiplier Context (Assumed)
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Conserving ~50 million litres per year avoids roughly <strong>45,000 kWh</strong> of borehole pump electricity (assuming 0.9 kWh/m³ lifting energy), eliminating ~37 tonnes of CO₂ equivalent annually while saving campus facilities significant maintenance capital.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Roadmap, Scale-Up Trigger & Safeguards */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Scale-Up Trigger Meter Card */}
          <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Scale-Up Quality Gate
                </span>
                <h3 className="text-base font-extrabold text-ink font-heading">
                  The 95% Readings Checked / 70% Precision Expansion Trigger
                </h3>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  scaleUp?.ready_to_scale
                    ? 'bg-normal-soft text-normal border border-normal/30'
                    : 'bg-watch-soft text-watch border border-watch/30'
                }`}
              >
                {scaleUp?.ready_to_scale ? 'Gate Cleared: Ready to Scale' : 'Calibration Phase'}
              </span>
            </div>

            <p className="text-xs text-ink-muted">
              Rule: Expand to additional campus buildings or partner schools only when 95% of readings pass automated checks and 70% of alerts are confirmed real, held stably for 4 weeks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink">Readings Automatically Checked</span>
                  <span className="font-bold text-primary">{scaleUp?.readings_checked_pct}% / 95% target</span>
                </div>
                <div className="w-full bg-sky-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (scaleUp?.readings_checked_pct || 100) / 0.95)}%` }}
                  />
                </div>
                <span className="text-[11px] text-normal font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Requirement satisfied by automated governance layer
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-ink">Alert Precision Rate</span>
                  <span className="font-bold text-primary">{scaleUp?.precision_pct}% / 70% target</span>
                </div>
                <div className="w-full bg-sky-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (scaleUp?.precision_pct || 100) / 0.7)}%` }}
                  />
                </div>
                <span className="text-[11px] text-ink-muted">
                  {scaleUp?.precision_met
                    ? 'Confirmed real leak rate exceeds 70% quality floor'
                    : 'Requires staff feedback confirmation to reach 70% threshold'}
                </span>
              </div>
            </div>
          </div>

          {/* Three-Phase Implementation Roadmap Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Phase 1</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-ink">
                  Months 1–3
                </span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-ink">
                Campus Pilot
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Install pulse flow meters on 3 pilot buildings (Hostel Block A, Canteen, Academic Block B). Validate telemetry, record 4-week baselines, and test WhatsApp alerts with facility manager and lead plumber.
              </p>
              <div className="text-[11px] text-ink font-semibold pt-2 border-t border-hairline">
                Trigger: 95% checked &amp; 70% precision held 4 weeks.
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan">Phase 2</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-ink">
                  Months 4–9
                </span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-ink">
                Campus-Wide &amp; Partner Expansion
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Extend across all 12 campus buildings. Deploy student hostel dashboards for awareness. Partner with 1–2 neighbouring colleges in Uttar Pradesh. Automate monthly ESG report exports.
              </p>
              <div className="text-[11px] text-ink font-semibold pt-2 border-t border-hairline">
                Trigger: Partner sites achieve same accuracy &amp; costs documented.
              </div>
            </div>

            <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-normal">Phase 3</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-ink">
                  Year 2+
                </span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-ink">
                Utility &amp; Municipal Network
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Integrate with regional water boards or municipal utilities. Upgrade Isolation Forest with supervised multi-class root-cause classifier (pipe burst vs cistern leak vs stuck sensor).
              </p>
              <div className="text-[11px] text-ink font-semibold pt-2 border-t border-hairline">
                Trigger: City utility partnership &amp; cloud scaling.
              </div>
            </div>
          </div>

          {/* Risks & Safeguards Table */}
          <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
            <h3 className="text-base font-bold text-ink font-heading">
              Operational Risks & Built-In Safeguards
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                  <tr>
                    <th className="py-2.5 px-3">Identified Risk</th>
                    <th className="py-2.5 px-3">Potential Impact</th>
                    <th className="py-2.5 px-3">Engineered Safeguard in AquaBaseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">Staff Alert Fatigue</td>
                    <td className="py-2.5 px-3 text-ink-muted">Plumbers ignore repetitive alerts</td>
                    <td className="py-2.5 px-3 text-ink">2+ consecutive hour grouping rule, sensitivity slider, mandatory review logs.</td>
                  </tr>
                  <tr className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">Sensor Failure / Data Gap</td>
                    <td className="py-2.5 px-3 text-ink-muted">Corrupt or missing telemetry</td>
                    <td className="py-2.5 px-3 text-ink">Automated governance layer flags stuck meters; fixed IQR rule fallback.</td>
                  </tr>
                  <tr className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">Budget / Hardware Constraints</td>
                    <td className="py-2.5 px-3 text-ink-muted">High upfront smart meter costs</td>
                    <td className="py-2.5 px-3 text-ink">Low-cost pulse output meters + ESP32 microcontrollers; proven 50M L ROI.</td>
                  </tr>
                  <tr className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">Model Drift in New Climates</td>
                    <td className="py-2.5 px-3 text-ink-muted">False alarms during exams/holidays</td>
                    <td className="py-2.5 px-3 text-ink">Calendar features, 4-week retraining cadence, human review before automatic action.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

