import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, BuildingSummary, ReadingPoint } from '../lib/api';
import { MetricCard } from '../components/MetricCard';
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
  Dot,
} from 'recharts';
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Droplet, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('hostel');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '35d'>('7d');
  
  // Replay animation state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  // Fetch building summaries
  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: api.getBuildings,
    refetchInterval: 10000,
  });

  // Calculate day range based on selector
  const rangeParams = React.useMemo(() => {
    if (timeRange === '24h') return { from: 34, to: 34 };
    if (timeRange === '7d') return { from: 28, to: 34 };
    return { from: 0, to: 34 };
  }, [timeRange]);

  // Fetch readings for selected building
  const { data: readingsData, isLoading: readingsLoading } = useQuery({
    queryKey: ['readings', selectedBuilding, rangeParams.from, rangeParams.to],
    queryFn: () => api.getReadings(selectedBuilding, rangeParams.from, rangeParams.to),
  });

  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
  });

  const currentBuilding = buildings?.find((b) => b.id === selectedBuilding);
  const rawPoints = readingsData?.points || [];

  // Handle replay loop
  useEffect(() => {
    let timer: any;
    if (isReplaying && replayIndex !== null && rawPoints.length > 0) {
      if (replayIndex < rawPoints.length) {
        timer = setTimeout(() => {
          setReplayIndex((prev) => (prev !== null ? prev + 4 : null)); // Advance 4 hours per step
        }, 120);
      } else {
        setIsReplaying(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isReplaying, replayIndex, rawPoints.length]);

  const handleStartReplay = () => {
    setTimeRange('7d');
    setReplayIndex(4);
    setIsReplaying(true);
  };

  const handleStopReplay = () => {
    setIsReplaying(false);
    setReplayIndex(null);
  };

  const chartPoints = React.useMemo(() => {
    if (replayIndex !== null) {
      return rawPoints.slice(0, Math.min(replayIndex, rawPoints.length));
    }
    return rawPoints;
  }, [rawPoints, replayIndex]);

  // Custom Dot for Alert / Flagged readings
  const renderAnomalyDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.flag && !payload.alert) return <g key={props.key} />;
    const color = payload.alert ? '#DC2626' : '#B45309';
    return (
      <circle
        key={props.key}
        cx={cx}
        cy={cy}
        r={payload.alert ? 5 : 3.5}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={2}
        className="animate-pulse"
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Building Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Building Water Dashboard
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Real-time hourly meter streams evaluated against building-specific diurnal normal baselines.
          </p>
        </div>

        {/* Building Tabs */}
        <div className="inline-flex p-1 bg-surface border border-hairline rounded-2xl shadow-sm self-start">
          {buildings?.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setSelectedBuilding(b.id);
                setReplayIndex(null);
                setIsReplaying(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                selectedBuilding === b.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-sky-50'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      {buildingsLoading || !currentBuilding ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Daily Water Use"
            value={currentBuilding.l_per_person_today}
            unit="L/person/day"
            delta={currentBuilding.delta_pct}
            deltaLabel={`vs ${currentBuilding.l_per_person_baseline} baseline`}
            icon={<Droplet className="w-5 h-5 text-primary" />}
            isAssumed={false}
          />
          <MetricCard
            label="Current Health"
            value={currentBuilding.status}
            subtext={`Anomaly score ${currentBuilding.latest_score.toFixed(3)} / 1.0`}
            badge={<StatusBadge status={currentBuilding.status} />}
            icon={<Activity className="w-5 h-5 text-cyan" />}
          />
          <MetricCard
            label="Leak Inflow Share"
            value={`${currentBuilding.leak_share_pct}%`}
            subtext="Min night flow (02-04 AM) × 24h"
            unit="of daily inflow"
            icon={<Clock className="w-5 h-5 text-watch" />}
            isAssumed={true}
          />
          <MetricCard
            label="Readings Checked"
            value={`${currentBuilding.readings_checked_pct}%`}
            subtext="All 15-min intervals verified"
            unit="governance pass"
            icon={<ShieldCheck className="w-5 h-5 text-normal" />}
          />
        </div>
      )}

      {/* Main Chart Section */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink font-heading flex items-center gap-2">
              <span>Hourly Water Flow vs Learned Normal Band</span>
              {isReplaying && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-alert-soft text-alert animate-pulse">
                  Replay Active ({Math.min(replayIndex || 0, rawPoints.length)} / {rawPoints.length} hrs)
                </span>
              )}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Light green area denotes usual 10th-90th percentile normal range for each hour. Red markers signify 2+ consecutive flagged alert hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Replay Controls */}
            {!isReplaying ? (
              <button
                onClick={handleStartReplay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-soft text-primary-dark hover:bg-cyan-100 font-semibold text-xs transition"
              >
                <Play className="w-3.5 h-3.5" /> Replay Last 7 Days
              </button>
            ) : (
              <button
                onClick={handleStopReplay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-watch-soft text-watch hover:bg-amber-100 font-semibold text-xs transition"
              >
                <Pause className="w-3.5 h-3.5" /> Pause Replay
              </button>
            )}

            {/* Time range selector */}
            <div className="inline-flex p-1 bg-sky-50 rounded-xl border border-hairline text-xs font-medium">
              {(['24h', '7d', '35d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setTimeRange(r);
                    setReplayIndex(null);
                    setIsReplaying(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    timeRange === r ? 'bg-surface text-ink font-bold shadow-sm' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {r === '24h' ? '24 Hours' : r === '7d' ? 'Last 7 Days' : 'All 35 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View */}
        {readingsLoading ? (
          <div className="py-20">
            <LoadingSkeleton rows={6} height="h-8" />
          </div>
        ) : (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                <XAxis
                  dataKey="t"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return timeRange === '24h'
                      ? `${d.getHours()}:00`
                      : `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
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
                        <div className="bg-surface/95 backdrop-blur-md p-3.5 rounded-2xl border border-hairline shadow-lg text-xs space-y-1.5 max-w-xs">
                          <div className="font-semibold text-ink">
                            {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ink-muted">Actual Flow:</span>
                            <span className="font-bold text-primary tabular-nums">{data.flow} L</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ink-muted">Usual Range:</span>
                            <span className="text-ink-muted tabular-nums">{data.expected_lo} - {data.expected_hi} L</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-ink-muted">Relative Ratio:</span>
                            <span className="font-medium text-ink tabular-nums">{data.rel}x</span>
                          </div>
                          <div className="pt-1.5 border-t border-hairline flex items-center justify-between">
                            <span className="text-ink-muted">Status:</span>
                            <StatusBadge status={data.status} size="sm" />
                          </div>
                          {data.reason && (
                            <div className="text-[11px] text-alert font-medium bg-alert-soft/50 p-1.5 rounded-lg">
                              {data.reason}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {/* Shaded Normal Range: from expected_lo to expected_hi */}
                <Area
                  type="monotone"
                  dataKey="expected_hi"
                  fill="#DCFCE7"
                  stroke="transparent"
                  name="Usual Upper Band (90th %ile)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="expected_lo"
                  fill="#F0F9FF"
                  stroke="transparent"
                  name="Usual Lower Band (10th %ile)"
                  fillOpacity={1.0}
                />

                {/* Actual Flow Line */}
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="#0D9488"
                  strokeWidth={2}
                  name="Hourly Flow (Litres)"
                  dot={renderAnomalyDot}
                  activeDot={{ r: 6, fill: '#06B6D4' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Latest Detected Incidents */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-watch" />
            <h3 className="text-base font-bold text-ink font-heading">
              Recent Anomaly Incidents for {currentBuilding?.name}
            </h3>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
          >
            Open Alerts Inbox <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {alerts && alerts.filter((a) => a.building_id === selectedBuilding).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                <tr>
                  <th className="py-2.5 px-3">Time Window</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Plain Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {alerts
                  .filter((a) => a.building_id === selectedBuilding)
                  .slice(0, 5)
                  .map((alert) => (
                    <tr key={alert.id} className="hover:bg-sky-50/50 transition">
                      <td className="py-2.5 px-3 font-medium text-ink">
                        {new Date(alert.start_time).toLocaleDateString()} {new Date(alert.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(alert.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-alert tabular-nums">
                        {alert.score.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-ink-muted max-w-md truncate">
                        {alert.reason}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          alert.status === 'real_leak'
                            ? 'bg-normal-soft text-normal'
                            : alert.status === 'false_alarm'
                            ? 'bg-alert-soft text-alert'
                            : alert.status === 'meter_error'
                            ? 'bg-watch-soft text-watch'
                            : 'bg-sky-100 text-ink-muted'
                        }`}>
                          {alert.status === 'unreviewed' ? 'Pending Review' : alert.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to="/alerts"
                          className="px-2.5 py-1 rounded-full bg-sky-100 hover:bg-primary hover:text-white text-ink font-semibold transition text-[11px]"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-ink-muted text-xs bg-sky-50/50 rounded-2xl border border-hairline">
            No active alerts detected on baseline data for this building. Use <Link to="/lab" className="text-primary font-semibold underline">Scenario Lab</Link> to inject faults.
          </div>
        )}
      </div>
    </div>
  );
};
