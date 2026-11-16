import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, ResearchSummaryResponse } from '../lib/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingDown,
  Globe2,
  Table,
  Layers,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const Research: React.FC = () => {
  const [showTable, setShowTable] = useState(false);

  const { data: research, isLoading } = useQuery<ResearchSummaryResponse>({
    queryKey: ['research'],
    queryFn: api.getResearchSummary,
  });

  const stats = research?.headline_stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight font-heading">
              Climate Data Research & Exploratory Insights
            </h1>
          </div>
          <p className="text-sm text-ink-muted mt-1">
            Empirical statistical analysis of the Kaggle Global Water Consumption Dataset (2000–2024, 20 countries, 500 records).
          </p>
        </div>

        <button
          onClick={() => setShowTable(!showTable)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-hairline hover:border-primary text-ink text-xs font-semibold shadow-sm transition self-start"
        >
          <Table className="w-4 h-4 text-primary" />
          {showTable ? 'Hide Raw Country Table' : 'View Country Data Table'}
        </button>
      </div>

      {/* Honesty Banner */}
      <div className="p-4 rounded-2xl bg-cyan-soft border border-cyan/30 text-ink text-xs leading-relaxed flex items-start gap-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <strong>Transparency Notice:</strong> All patterns described below are findings{' '}
          <em>"in the public dataset"</em>. As discovered during data audits, total volume and per-person ratios imply ~5 billion people per country, confirming the dataset is likely synthetic. These findings motivated the core thesis of AquaBaseline: static thresholds fail, and automated integrity validation is vital.
        </div>
      </div>

      {/* Four Insight Cards */}
      {isLoading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-2xl p-5 border border-hairline shadow-card space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Pattern 1: Flat Macro Trend
            </span>
            <div className="text-2xl font-extrabold text-ink tabular-nums">
              +0.6% Change
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Global per-person consumption is completely flat: {stats.year_2000_mean} L/day (2000) to {stats.year_2024_mean} L/day (2024). 25-year overall mean is {stats.overall_mean} L/day.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-5 border border-hairline shadow-card space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan">
              Pattern 2: Swing &gt; Gap
            </span>
            <div className="text-2xl font-extrabold text-ink tabular-nums">
              {stats.avg_within_country_swing} vs {stats.between_country_gap} L
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              A country's internal year-to-year swing ({stats.avg_within_country_swing} L/day) is larger than the gap between the highest ({stats.highest_country} {stats.highest_value} L) and lowest ({stats.lowest_country} {stats.lowest_value} L) countries.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-5 border border-hairline shadow-card space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-watch">
              Pattern 3: Distribution
            </span>
            <div className="text-2xl font-extrabold text-ink tabular-nums">
              {stats.normal_band_pct}% Normal
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              91% of all records fall between 200–350 L/day. Only 8 of 500 records are extreme statistical outliers (5 below ~175 L, 3 above ~375 L).
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-5 border border-hairline shadow-card space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-alert">
              Pattern 4: No Depletion Link
            </span>
            <div className="text-2xl font-extrabold text-ink tabular-nums">
              r = {stats.corr_total_depletion} / {stats.corr_percapita_depletion}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Zero correlation between water consumption and groundwater depletion in the dataset (r = +0.02 total, r = -0.05 per capita). Depletion is driven by local over-extraction, not national means.
            </p>
          </div>
        </div>
      )}

      {/* Chart 1: 25-Year Trend */}
      <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-ink font-heading">
            Chart A: 25-Year Global Per-Capita Trend with Middle-50% Band (2000–2024)
          </h2>
          <p className="text-xs text-ink-muted">
            Shaded cyan band displays the 25th to 75th percentile range across all 20 countries. Red dashed line indicates the 25-year constant mean (276.4 L/day). Note: Y-axis begins at 0.
          </p>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={5} height="h-8" />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={research?.trend_series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                <XAxis dataKey="year" stroke="#4F6B78" fontSize={11} />
                <YAxis domain={[0, 400]} stroke="#4F6B78" fontSize={11} unit=" L" />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value} L/day`,
                    name === 'mean'
                      ? 'Annual Mean'
                      : name === 'q75'
                      ? '75th %ile'
                      : name === 'q25'
                      ? '25th %ile'
                      : name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="q75"
                  fill="#CFFAFE"
                  stroke="transparent"
                  name="Middle 50% Upper (Q3)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="q25"
                  fill="#F0F9FF"
                  stroke="transparent"
                  name="Middle 50% Lower (Q1)"
                  fillOpacity={1.0}
                />
                <Line
                  type="monotone"
                  dataKey="mean"
                  stroke="#0D9488"
                  strokeWidth={2.5}
                  name="Annual Mean (L/person/day)"
                  dot={{ r: 3, fill: '#0D9488' }}
                />
                <ReferenceLine
                  y={stats?.overall_mean}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  label={{ value: `25-Yr Mean: ${stats?.overall_mean} L`, fill: '#DC2626', fontSize: 11 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Country Comparison & Chart 3: Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Comparison */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink font-heading">
              Chart B: Country Per-Capita Means (Gap: 30 L/day)
            </h3>
            <p className="text-xs text-ink-muted">
              India highest (295 L), Indonesia lowest (266 L). Average within-country swing is ~42 L/day.
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton rows={5} height="h-8" />
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={research?.country_comparison}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                  <XAxis type="number" domain={[240, 310]} stroke="#4F6B78" fontSize={11} unit=" L" />
                  <YAxis type="category" dataKey="country" stroke="#4F6B78" fontSize={10} width={80} />
                  <Tooltip formatter={(val: any) => [`${val} L/person/day`, '25-Yr Mean']} />
                  <Bar dataKey="mean" radius={[0, 6, 6, 0]}>
                    {research?.country_comparison.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.country === 'India'
                            ? '#0D9488'
                            : entry.country === 'Indonesia'
                            ? '#06B6D4'
                            : '#99F6E4'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Histogram of 500 Records */}
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-ink font-heading">
              Chart C: Distribution Histogram (500 Records)
            </h3>
            <p className="text-xs text-ink-muted">
              Frequency distribution of all 500 country-year records. Amber bars indicate IQR outlier zones (&lt;{stats?.iqr_lower_bound} L or &gt;{stats?.iqr_upper_bound} L).
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton rows={5} height="h-8" />
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={research?.distribution_histogram} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" />
                  <XAxis dataKey="bin" stroke="#4F6B78" fontSize={10} angle={-25} textAnchor="end" height={45} />
                  <YAxis stroke="#4F6B78" fontSize={11} />
                  <Tooltip formatter={(val: any) => [val, 'Records Count']} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {research?.distribution_histogram.map((entry, index) => (
                      <Cell
                        key={`hist-${index}`}
                        fill={entry.is_outlier_zone ? '#F59E0B' : '#0D9488'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Optional Data Table */}
      {showTable && research?.country_comparison && (
        <div className="bg-surface rounded-3xl p-6 border border-hairline shadow-card space-y-4 animate-in fade-in-50">
          <h3 className="text-base font-bold text-ink font-heading">
            Full 20-Country Statistical Summary (2000–2024)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 text-ink-muted uppercase tracking-wider font-semibold border-b border-hairline">
                <tr>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">25-Yr Mean (L/day)</th>
                  <th className="py-2.5 px-3">Std Dev</th>
                  <th className="py-2.5 px-3">Min</th>
                  <th className="py-2.5 px-3">Max</th>
                  <th className="py-2.5 px-3 text-right">Avg Yearly Swing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {research.country_comparison.map((c) => (
                  <tr key={c.country} className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">{c.country}</td>
                    <td className="py-2.5 px-3 tabular-nums font-bold text-primary">{c.mean}</td>
                    <td className="py-2.5 px-3 tabular-nums text-ink-muted">{c.std}</td>
                    <td className="py-2.5 px-3 tabular-nums">{c.min}</td>
                    <td className="py-2.5 px-3 tabular-nums">{c.max}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-medium text-ink">
                      {c.avg_yearly_swing} L/day
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

