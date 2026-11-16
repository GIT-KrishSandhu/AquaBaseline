import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ScenarioRequest, ReadingPoint } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  FlaskConical,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Droplets,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ScenarioLab: React.FC = () => {
  const queryClient = useQueryClient();

  const [buildingId, setBuildingId] = useState<string>('hostel');
  const [scenarioType, setScenarioType] = useState<
    'night_leak' | 'tank_overflow' | 'stuck_meter' | 'data_gap' | 'holiday'
  >('night_leak');
  const [startDay, setStartDay] = useState<number>(30);
  const [nights, setNights] = useState<number>(3);
  const [magnitude, setMagnitude] = useState<number>(1000);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  // Fetch readings for last 7 days
  const { data: readingsData, isLoading: readingsLoading } = useQuery({
    queryKey: ['readings', buildingId, 28, 34],
    queryFn: () => api.getReadings(buildingId, 28, 34),
  });

  // Inject Mutation
  const injectMutation = useMutation({
    mutationFn: (req: ScenarioRequest) => api.injectScenario(req),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setLastActionResult(
        `Scenario '${scenarioType}' injected into ${buildingId}. ${data.alerts_created} alerts logged.`
      );
    },
  });

  // Reset Mutation
  const resetMutation = useMutation({
    mutationFn: api.resetScenarios,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      setLastActionResult('All scenarios reset back to normal baseline across all buildings.');
    },
  });

  const handleInject = () => {
    injectMutation.mutate({
      building_id: buildingId,
      type: scenarioType,
      start_day: startDay,
      nights: nights,
      magnitude: magnitude,
    });
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  // Check how many points in the loaded range are flagged or alert
  const points = readingsData?.points || [];
  const alertPoints = points.filter((p) => p.alert);
  const flagPoints = points.filter((p) => p.flag);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Scenario Lab & Fault Injection
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Simulate real campus water anomalies (night leaks, tank overflows, stuck meters) to test detection accuracy and compare with fixed-threshold rules.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-hairline hover:border-alert text-ink hover:text-alert text-xs font-semibold shadow-sm transition self-start"
        >
          <RotateCcw className="w-4 h-4" /> Reset All Scenarios
        </button>
      </div>

      {lastActionResult && (
        <div className="p-4 rounded-2xl bg-cyan-soft border border-cyan/30 text-ink text-xs font-medium flex items-center justify-between">
          <span>{lastActionResult}</span>
          <button
            onClick={() => setLastActionResult(null)}
            className="text-ink-muted hover:text-ink font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Deck & Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selector & Form */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-5">
          <div className="flex items-center gap-2 text-ink font-bold font-heading text-base">
            <Sliders className="w-5 h-5 text-primary" />
            <span>Injection Parameters</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Building */}
            <div>
              <label className="block font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1.5">
                Target Building
              </label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full bg-sky-50 border border-hairline rounded-xl px-3 py-2 text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="hostel">Hostel Block A (400 students)</option>
                <option value="canteen">Canteen (1,200 meals/day)</option>
                <option value="academic">Academic Block B (1,500 students)</option>
              </select>
            </div>

            {/* Scenario Preset */}
            <div>
              <label className="block font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1.5">
                Fault Scenario Type
              </label>
              <select
                value={scenarioType}
                onChange={(e: any) => {
                  const val = e.target.value;
                  setScenarioType(val);
                  if (val === 'night_leak') setMagnitude(buildingId === 'hostel' ? 1000 : 600);
                  if (val === 'tank_overflow') setMagnitude(800);
                  if (val === 'holiday') setMagnitude(0.4);
                }}
                className="w-full bg-sky-50 border border-hairline rounded-xl px-3 py-2 text-ink text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="night_leak">Night Leak (+L/h at 02:00-04:00 AM)</option>
                <option value="tank_overflow">Overnight Tank Overflow (6h steady flow)</option>
                <option value="stuck_meter">Stuck Meter (Constant repeated value)</option>
                <option value="data_gap">Data Gap (Missing sensor telemetry)</option>
                <option value="holiday">Holiday / Exam Week (0.4x or 1.3x consumption)</option>
              </select>
            </div>

            {/* Duration (Nights) */}
            <div>
              <div className="flex justify-between font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1">
                <span>Duration</span>
                <span className="text-primary font-bold">{nights} night(s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={nights}
                onChange={(e) => setNights(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-muted">
                <span>1 night</span>
                <span>3 nights (default)</span>
                <span>5 nights</span>
              </div>
            </div>

            {/* Magnitude */}
            {scenarioType !== 'stuck_meter' && scenarioType !== 'data_gap' && (
              <div>
                <div className="flex justify-between font-semibold text-ink-muted uppercase tracking-wider text-[11px] mb-1">
                  <span>Magnitude</span>
                  <span className="text-primary font-bold">
                    {scenarioType === 'holiday' ? `${magnitude}x` : `+${magnitude} L/hour`}
                  </span>
                </div>
                <input
                  type="range"
                  min={scenarioType === 'holiday' ? 0.2 : 250}
                  max={scenarioType === 'holiday' ? 1.5 : 2500}
                  step={scenarioType === 'holiday' ? 0.1 : 50}
                  value={magnitude}
                  onChange={(e) => setMagnitude(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            )}

            <button
              onClick={handleInject}
              disabled={injectMutation.isPending}
              className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              {injectMutation.isPending ? 'Simulating...' : 'Inject Fault into Model'}
            </button>
          </div>
        </div>

        {/* Model vs Traditional Rule Detection Comparison */}
        <div className="lg:col-span-2 bg-surface rounded-3xl p-6 border border-hairline shadow-card flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink font-heading mb-1">
              Detection Outcome Comparison: AI vs Fixed Daily Threshold
            </h2>
            <p className="text-xs text-ink-muted">
              Why building-specific hour awareness is essential for campus water conservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AquaBaseline AI Model */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-primary">
                  AquaBaseline AI Model
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-normal-soft text-normal">
                  Hour-Aware
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-ink tabular-nums">
                  {alertPoints.length > 0 ? (
                    <span className="text-alert">{alertPoints.length} Alert Hours</span>
                  ) : flagPoints.length > 0 ? (
                    <span className="text-watch">{flagPoints.length} Watch Hours</span>
                  ) : (
                    <span className="text-normal">Normal</span>
                  )}
                </div>
                <p className="text-xs text-ink-muted">
                  {alertPoints.length > 0
                    ? `Successfully detected! Contiguous 02:00-04:00 leak generated high anomaly score relative to ${buildingId}'s 0.07 normal base.`
                    : 'Awaiting fault injection. Model is monitoring hourly diurnal normal band.'}
                </p>
              </div>

              <div className="pt-2 border-t border-hairline text-[11px] text-ink font-medium">
                Reason: {points.find((p) => p.reason)?.reason || 'Operating within learned 10th-90th percentile bounds.'}
              </div>
            </div>

            {/* Traditional Daily Total Rule */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-ink-muted">
                  Daily-Total IQR Rule
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-alert-soft text-alert">
                  Traditional
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-ink-muted tabular-nums">
                  0 Flagged
                </div>
                <p className="text-xs text-ink-muted">
                  Missed completely! A 2-hour 1,000 L/h leak adds only +2,000 L (about 4.5% of total day inflow), perfectly masked by routine ±12% daily student variance.
                </p>
              </div>

              <div className="pt-2 border-t border-hairline text-[11px] text-ink-muted">
                Result: Gross daily volume remained well inside the Q1 - 1.5×IQR / Q3 + 1.5×IQR boundary.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-primary-soft/60 rounded-2xl border border-primary/20 text-xs">
            <span className="font-medium text-ink">
              Want to see this alert in the maintenance dispatch log?
            </span>
            <Link
              to="/alerts"
              className="font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1"
            >
              Open Alerts Inbox <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Injected Timeline Chart */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
        <h3 className="text-base font-bold text-ink font-heading">
          Simulated Flow Waveform: Days 28 to 34
        </h3>
        <p className="text-xs text-ink-muted">
          Red dots highlight AI anomaly detections where flow diverged from the building's historical baseline.
        </p>

        {readingsLoading ? (
          <LoadingSkeleton rows={5} height="h-8" />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                <XAxis
                  dataKey="t"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
                  }}
                  stroke="#4F6B78"
                  fontSize={11}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis stroke="#4F6B78" fontSize={11} unit=" L" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ReadingPoint;
                      const dateObj = new Date(data.t);
                      return (
                        <div className="bg-surface p-3 rounded-xl border border-hairline shadow-md text-xs space-y-1">
                          <div className="font-bold text-ink">{dateObj.toLocaleString()}</div>
                          <div>Flow: <span className="font-semibold text-primary">{data.flow} L</span></div>
                          <div>Status: <StatusBadge status={data.status} size="sm" /></div>
                          {data.reason && <div className="text-alert font-medium">{data.reason}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="expected_hi"
                  fill="#DCFCE7"
                  stroke="transparent"
                  name="Usual Upper Band"
                  fillOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#0D9488"
                  strokeWidth={2}
                  name="Hourly Flow"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload.alert) return <g key={props.key} />;
                    return (
                      <circle
                        key={props.key}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

