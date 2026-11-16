import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, AlertItem } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Alerts: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string>('');

  // Fetch Alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
  });

  // Fetch Settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings,
  });

  // Fetch Metrics for Precision
  const { data: metricsData } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
  });

  // Feedback Mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ id, outcome, note }: { id: number; outcome: string; note: string }) =>
      api.submitFeedback(id, outcome, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setSelectedAlert(null);
      setFeedbackNote('');
    },
  });

  // Settings Mutation (Sensitivity slider)
  const settingsMutation = useMutation({
    mutationFn: (newPercentile: number) =>
      api.updateSettings({
        alert_percentile: newPercentile,
        campus_size: settings?.campus_size || 5000,
        target_cut_pct: settings?.target_cut_pct || 10.0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  // Retrain Mutation
  const retrainMutation = useMutation({
    mutationFn: () => api.retrainModel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readings'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const filteredAlerts = React.useMemo(() => {
    if (!alerts) return [];
    if (statusFilter === 'all') return alerts;
    return alerts.filter((a) => a.status === statusFilter);
  }, [alerts, statusFilter]);

  const precision = metricsData?.precision;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Facility Alerts & Feedback Loop
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Actionable anomaly inbox for facility staff. Human feedback (Real leak / False alarm / Meter error) trains the model and tunes sensitivity.
          </p>
        </div>

        <button
          onClick={() => retrainMutation.mutate()}
          disabled={retrainMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition self-start"
        >
          <Sparkles className="w-4 h-4" />
          {retrainMutation.isPending ? 'Retraining...' : 'Retrain Models with Feedback'}
        </button>
      </div>

      {/* Retune Alert Banner if precision < 50% */}
      {precision?.needs_retuning && (
        <div className="p-4 rounded-2xl bg-alert-soft border border-alert/30 text-alert text-xs font-semibold flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              <strong>Action Required:</strong> {precision.banner_message} (Current precision {precision.precision_pct}% &lt; 50% threshold).
            </span>
          </div>
          <span className="text-[11px] font-normal underline">
            Adjust sensitivity slider below to reduce false alarms.
          </span>
        </div>
      )}

      {/* Precision KPI & Sensitivity Slider Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Precision Card */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Alert Precision Rate
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink tabular-nums">
                {precision ? `${precision.precision_pct}%` : '100%'}
              </span>
              <span className="text-xs text-ink-muted font-medium">confirmed real</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-hairline text-xs space-y-1">
            <div className="flex justify-between text-ink-muted">
              <span>Reviewed / Total Alerts:</span>
              <span className="font-semibold text-ink">
                {precision?.reviewed_alerts || 0} / {precision?.total_alerts || 0}
              </span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Real Leaks Confirmed:</span>
              <span className="font-semibold text-normal">{precision?.real_leaks || 0}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>False Alarms / Meter Errors:</span>
              <span className="font-semibold text-alert">
                {(precision?.false_alarms || 0) + (precision?.meter_errors || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Sensitivity Slider Card */}
        <div className="md:col-span-2 bg-surface rounded-3xl p-6 border border-hairline shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" /> Alert Sensitivity (Percentile Cutoff)
              </span>
              <span className="text-sm font-extrabold text-primary tabular-nums">
                {settings?.alert_percentile || 99.0}%ile
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Higher percentile (e.g. 99.5%) raises only extreme anomalies (fewer alerts, higher precision). Lower percentile (e.g. 97.0%) catches smaller leaks earlier but increases false alarms.
            </p>
          </div>

          <div>
            <input
              type="range"
              min="95.0"
              max="99.9"
              step="0.1"
              value={settings?.alert_percentile || 99.0}
              onChange={(e) => settingsMutation.mutate(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-muted mt-1 font-medium">
              <span>95.0% (High Recall / More digests)</span>
              <span>99.0% (Balanced Baseline)</span>
              <span>99.9% (Critical Emergency Only)</span>
            </div>
          </div>

          <div className="text-[11px] text-ink-muted bg-sky-50 p-2.5 rounded-xl border border-hairline">
            Rule: 2 or more consecutive hours exceeding this percentile trigger a high-urgency facility alert. Single hours are routed to the daily Watch digest.
          </div>
        </div>
      </div>

      {/* Alerts Inbox Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table / List View */}
        <div className="lg:col-span-2 bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink font-heading flex items-center gap-2">
              <span>Detected Anomaly Incidents</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-ink">
                {filteredAlerts.length}
              </span>
            </h2>

            {/* Filter Pills */}
            <div className="inline-flex p-1 bg-sky-50 rounded-xl border border-hairline text-xs font-medium self-start">
              {[
                { id: 'all', label: 'All' },
                { id: 'unreviewed', label: 'Pending' },
                { id: 'real_leak', label: 'Real Leaks' },
                { id: 'false_alarm', label: 'False Alarms' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    statusFilter === f.id
                      ? 'bg-surface text-ink font-bold shadow-sm'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {alertsLoading ? (
            <LoadingSkeleton rows={5} height="h-10" />
          ) : filteredAlerts.length > 0 ? (
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedAlert?.id === alert.id
                      ? 'bg-sky-50/80 border-primary shadow-sm'
                      : 'bg-surface hover:bg-sky-50/40 border-hairline'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{alert.building_name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          alert.status === 'real_leak'
                            ? 'bg-normal-soft text-normal'
                            : alert.status === 'false_alarm'
                            ? 'bg-alert-soft text-alert'
                            : alert.status === 'meter_error'
                            ? 'bg-watch-soft text-watch'
                            : 'bg-watch-soft text-watch'
                        }`}
                      >
                        {alert.status === 'unreviewed' ? 'Pending Review' : alert.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(alert.start_time).toLocaleDateString()} {new Date(alert.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(alert.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-ink-muted max-w-xl truncate">{alert.reason}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-ink-muted block">Score</span>
                      <span className="font-extrabold text-sm text-alert tabular-nums">
                        {alert.score.toFixed(3)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-ink-muted bg-sky-50/40 rounded-2xl border border-hairline space-y-1">
              <p className="font-semibold text-ink">No alerts found matching this filter.</p>
              <p>Simulate new leaks or overflows in the Scenario Lab to generate new events.</p>
            </div>
          )}
        </div>

        {/* Feedback / Detail Panel */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h3 className="font-bold text-base text-ink font-heading">
              Incident Feedback Form
            </h3>
            {selectedAlert && (
              <span className="text-[11px] text-ink-muted font-medium">
                ID #{selectedAlert.id}
              </span>
            )}
          </div>

          {selectedAlert ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-muted">Target Site</span>
                <p className="font-bold text-sm text-ink">{selectedAlert.building_name}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-muted">Time Window</span>
                <p className="text-ink font-medium">
                  {new Date(selectedAlert.start_time).toLocaleString()} – {new Date(selectedAlert.end_time).toLocaleTimeString()}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-muted">Detection Reason</span>
                <p className="p-2.5 rounded-xl bg-sky-50 text-ink border border-hairline text-xs mt-1 leading-relaxed">
                  {selectedAlert.reason}
                </p>
              </div>

              {selectedAlert.note && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-ink-muted">Staff Log Note</span>
                  <p className="text-ink italic bg-sky-50 p-2 rounded-lg mt-0.5">{selectedAlert.note}</p>
                </div>
              )}

              {/* Feedback note input */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-ink-muted mb-1">
                  Maintenance Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Plumber found flush valve leaking in 2nd floor restroom."
                  className="w-full bg-sky-50 border border-hairline rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] uppercase font-semibold text-ink-muted">
                  Log Inspection Outcome:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() =>
                      feedbackMutation.mutate({
                        id: selectedAlert.id,
                        outcome: 'real_leak',
                        note: feedbackNote,
                      })
                    }
                    className="py-2 px-3 rounded-xl bg-normal-soft text-normal hover:bg-green-200 border border-normal/30 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Real Leak Confirmed
                  </button>

                  <button
                    onClick={() =>
                      feedbackMutation.mutate({
                        id: selectedAlert.id,
                        outcome: 'false_alarm',
                        note: feedbackNote,
                      })
                    }
                    className="py-2 px-3 rounded-xl bg-alert-soft text-alert hover:bg-red-200 border border-alert/30 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> False Alarm
                  </button>

                  <button
                    onClick={() =>
                      feedbackMutation.mutate({
                        id: selectedAlert.id,
                        outcome: 'meter_error',
                        note: feedbackNote,
                      })
                    }
                    className="py-2 px-3 rounded-xl bg-watch-soft text-watch hover:bg-amber-200 border border-watch/30 font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" /> Sensor / Meter Error
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-ink-muted space-y-2">
              <Info className="w-6 h-6 text-primary mx-auto opacity-80" />
              <p className="font-medium text-ink">No incident selected</p>
              <p>Click on any alert from the left inbox to review diagnostics and log feedback.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

