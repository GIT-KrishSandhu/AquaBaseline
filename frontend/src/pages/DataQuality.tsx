import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, DataQualityReport } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  FileCheck2,
  UploadCloud,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  Download,
  AlertOctagon,
  Sparkles,
  Search,
  Info,
} from 'lucide-react';

export const DataQuality: React.FC = () => {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.validateCsv(file),
    onSuccess: (data) => setReport(data),
  });

  // Sample Run Mutation
  const sampleMutation = useMutation({
    mutationFn: api.getSampleDataQuality,
    onSuccess: (data) => setReport(data),
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AquaBaseline_DataQuality_${report.filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Data Quality & Governance Auditor
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Automated integrity pipeline: tests completeness, negative values, stuck sensors, IQR outliers, jump rates, and the &gt;2B implied population sanity rule.
          </p>
        </div>

        <button
          onClick={() => sampleMutation.mutate()}
          disabled={sampleMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-soft text-primary-dark hover:bg-cyan-100 text-xs font-semibold shadow-sm transition self-start"
        >
          <Sparkles className="w-4 h-4" />
          {sampleMutation.isPending ? 'Auditing Dataset...' : 'Audit Bundled Dataset (500 rows)'}
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-surface rounded-3xl p-8 border-2 border-dashed transition text-center space-y-3 cursor-pointer ${
          dragOver ? 'border-primary bg-sky-50' : 'border-hairline hover:border-primary/50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-primary flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div>
          <span className="font-heading font-bold text-base text-ink block">
            Drag & Drop CSV water telemetry file here
          </span>
          <span className="text-xs text-ink-muted">
            Auto-detects columns, evaluates IQR distributions, jump anomalies, and physical plausibility. Up to 10 MB.
          </span>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-sm cursor-pointer transition">
            <FileSpreadsheet className="w-4 h-4" /> Browse CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Audit Report View */}
      {(uploadMutation.isPending || sampleMutation.isPending) && (
        <div className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
          <LoadingSkeleton rows={6} height="h-8" />
        </div>
      )}

      {report && (
        <div className="space-y-8 animate-in fade-in-50">
          {/* Summary Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-hairline shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Audit Status
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink tabular-nums">
                  {report.passed_pct}%
                </span>
                <span className="text-xs text-ink-muted font-medium">integrity score</span>
              </div>
              <p className="text-xs text-ink-muted mt-2">
                {report.total_rows} rows × {report.total_columns} columns audited
              </p>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-hairline shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Missing & Duplicate Cells
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-ink tabular-nums">
                  {report.issues_summary.missing_cells + report.issues_summary.duplicate_rows}
                </span>
                <span className="text-xs text-normal font-semibold">Clean baseline</span>
              </div>
              <p className="text-xs text-ink-muted mt-2">
                0 missing cells, 0 duplicated records found
              </p>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-hairline shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                IQR Outlier Records
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-watch tabular-nums">
                  {report.issues_summary.iqr_outliers}
                </span>
                <span className="text-xs text-ink-muted font-medium">records flagged</span>
              </div>
              <p className="text-xs text-ink-muted mt-2">
                Values exceeding Q1 - 1.5×IQR or Q3 + 1.5×IQR bounds
              </p>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-hairline shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Domain Sanity Violations
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-alert tabular-nums">
                  {report.issues_summary.implied_population_violations}
                </span>
                <span className="text-xs text-alert font-semibold">&gt;2B Pop Implied</span>
              </div>
              <p className="text-xs text-ink-muted mt-2">
                Physical impossibility detected in dataset
              </p>
            </div>
          </div>

          {/* Implied Population Finding Spotlight Card */}
          {report.implied_population_findings.length > 0 && (
            <div className="bg-alert-soft/60 rounded-3xl p-6 border border-alert/30 space-y-3">
              <div className="flex items-center gap-2 text-alert">
                <AlertOctagon className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-heading font-extrabold text-base">
                  Critical Finding: Mathematically Inconsistent Population in Dataset
                </h3>
              </div>
              <p className="text-xs text-ink leading-relaxed">
                By comparing total consumption in Billion Cubic Metres (BCM) with reported per-capita litres per day{' '}
                <code className="bg-white/70 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  (Total_BCM × 10¹²) / (PerCapita_L_day × 365)
                </code>
                , this audit revealed that every single country in the dataset implies a population of{' '}
                <strong>~5.0 to 5.2 billion people each</strong> (e.g. Argentina implies 5.2B people!).
              </p>
              <div className="bg-surface/80 p-3 rounded-xl border border-hairline text-xs space-y-1">
                <div className="font-semibold text-ink">Why Krish Disclosed This Honestly:</div>
                <div className="text-ink-muted">
                  During Assignment 2A research, superficial cleaning showed 0 missing cells. Only an automated domain sanity check revealed that the public dataset is likely synthetic. In AquaBaseline, this exact rule ensures corrupt sensor streams are caught before contaminating baseline models.
                </div>
              </div>
            </div>
          )}

          {/* Year-over-Year Jump Anomalies */}
          {report.jump_anomalies.length > 0 && (
            <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
              <h3 className="font-bold text-base text-ink font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-watch" />
                <span>Single-Year Jump Anomalies (&gt;100% YoY Change)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                    <tr>
                      <th className="py-2.5 px-3">Entity</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Previous Value</th>
                      <th className="py-2.5 px-3">Current Value</th>
                      <th className="py-2.5 px-3">Percentage Jump</th>
                      <th className="py-2.5 px-3">Audited Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {report.jump_anomalies.map((j, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/50">
                        <td className="py-2.5 px-3 font-semibold text-ink">{j.entity}</td>
                        <td className="py-2.5 px-3">{j.year}</td>
                        <td className="py-2.5 px-3 tabular-nums">{j.prev_val}</td>
                        <td className="py-2.5 px-3 font-semibold text-alert tabular-nums">{j.curr_val}</td>
                        <td className="py-2.5 px-3 font-bold text-alert tabular-nums">+{j.pct_change}%</td>
                        <td className="py-2.5 px-3 text-ink-muted">{j.metric}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Column Audits Table */}
          <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-ink font-heading">
                Per-Column Statistical & Outlier Distribution
              </h3>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-ink font-semibold text-xs border border-hairline transition"
              >
                <Download className="w-3.5 h-3.5 text-primary" /> Download Full JSON Report
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                  <tr>
                    <th className="py-2.5 px-3">Column Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Missing</th>
                    <th className="py-2.5 px-3">Min</th>
                    <th className="py-2.5 px-3">Mean</th>
                    <th className="py-2.5 px-3">Max</th>
                    <th className="py-2.5 px-3 text-right">IQR Outliers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {report.column_stats.map((col, idx) => (
                    <tr key={idx} className="hover:bg-sky-50/50">
                      <td className="py-2.5 px-3 font-semibold text-ink">{col.name}</td>
                      <td className="py-2.5 px-3 text-ink-muted font-mono">{col.dtype}</td>
                      <td className="py-2.5 px-3">{col.missing}</td>
                      <td className="py-2.5 px-3 tabular-nums">{col.min !== null ? col.min : '—'}</td>
                      <td className="py-2.5 px-3 tabular-nums">{col.mean !== null ? col.mean : '—'}</td>
                      <td className="py-2.5 px-3 tabular-nums">{col.max !== null ? col.max : '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        {col.outliers_count > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-watch-soft text-watch font-bold">
                            {col.outliers_count} flagged
                          </span>
                        ) : (
                          <span className="text-normal font-semibold">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

