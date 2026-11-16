import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import {
  Droplets,
  ArrowRight,
  TrendingDown,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  Wrench,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { data: valData } = useQuery({
    queryKey: ['validation'],
    queryFn: api.getValidationResults,
  });

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-16 pb-20 border-b border-hairline">
        {/* Decorative Water Ripple Shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15%" cy="30%" r="200" fill="none" stroke="#0D9488" strokeWidth="1" strokeDasharray="6 8" />
            <circle cx="15%" cy="30%" r="350" fill="none" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx="85%" cy="80%" r="260" fill="none" stroke="#16A34A" strokeWidth="1" strokeOpacity="0.4" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-hairline text-ink text-xs font-semibold shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-normal animate-pulse" />
              <span>1M1B Green Skills &amp; Applied AI Capstone</span>
              <span className="text-ink-muted">· Krish Sandhu (KIET)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight font-heading leading-tight">
              Smart Water Monitoring That Learns What{' '}
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan">
                "Normal"
              </span>{' '}
              Looks Like.
            </h1>

            <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-2xl">
              Catch hidden leaks and corrupt readings early by comparing every building against its own diurnal rhythm—not against blunt, fixed campus thresholds.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 group"
              >
                <span>Open Live Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/story"
                className="px-6 py-3 rounded-full bg-surface hover:bg-sky-50 text-ink font-semibold text-sm border border-hairline shadow-sm transition"
              >
                Read the Student Journey
              </Link>
            </div>
          </div>

          {/* Three Headline Stat Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-4xl">
            <div className="bg-surface/90 backdrop-blur-sm p-4 rounded-2xl border border-hairline shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase text-ink-muted block">
                Macro Flat Trend
              </span>
              <div className="text-2xl font-extrabold text-ink tabular-nums">276 L/day</div>
              <span className="text-xs text-ink-muted">
                Flat 25-year average in public dataset (2000–2024).
              </span>
            </div>

            <div className="bg-surface/90 backdrop-blur-sm p-4 rounded-2xl border border-hairline shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase text-ink-muted block">
                The Core Anomaly Paradox
              </span>
              <div className="text-2xl font-extrabold text-primary tabular-nums">
                42 vs 30 L/day
              </div>
              <span className="text-xs text-ink-muted">
                Internal swing is larger than between-unit gaps.
              </span>
            </div>

            <div className="bg-surface/90 backdrop-blur-sm p-4 rounded-2xl border border-hairline shadow-sm space-y-1">
              <span className="text-xs font-semibold uppercase text-ink-muted block">
                Daily Threshold Failure
              </span>
              <div className="text-2xl font-extrabold text-alert tabular-nums">
                0 of 60 Caught
              </div>
              <span className="text-xs text-ink-muted">
                By daily IQR rules in 20-seed validation test.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works 4-Step Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Engineering Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink font-heading">
            How AquaBaseline Detects Anomalies
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted">
            Replacing rigid institution-wide rules with localized machine learning and automated data governance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-3xl border border-hairline shadow-card space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-primary flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-heading font-bold text-base text-ink">15-Min Telemetry</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Meters capture building intake flow every 15 minutes, catching overnight leaks while gross daily volume still looks normal.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-hairline shadow-card space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-cyan-soft text-primary-dark flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-heading font-bold text-base text-ink">Per-Capita Normal</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Total volume is divided by daily hostel and academic headcount to track authentic consumption in Litres per Person per Day.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-hairline shadow-card space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-normal-soft text-normal flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-heading font-bold text-base text-ink">Hour-Aware AI</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Isolation Forest learns each hour's expected median flow. Anomaly score triggers Normal, Watch (1 hr), or Alert (2+ consecutive hrs).
            </p>
          </div>

          <div className="bg-surface p-6 rounded-3xl border border-hairline shadow-card space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-watch-soft text-watch flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-heading font-bold text-base text-ink">Act &amp; Learn</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Plumbers inspect with clear plain-language reasons. Staff feedback (real leak / false alarm) tunes thresholds and retrains models.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-xl font-bold text-ink font-heading">
          Explore the Complete Capstone Deliverable Suite
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/lab"
            className="p-6 bg-surface rounded-3xl border border-hairline shadow-card hover:shadow-card-hover transition group space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink group-hover:text-primary transition flex items-center justify-between">
              Scenario Lab <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Test the AI detector under simulated night leaks, tank overflows, stuck meters, data gaps, and holiday exam schedules.
            </p>
          </Link>

          <Link
            to="/data-quality"
            className="p-6 bg-surface rounded-3xl border border-hairline shadow-card hover:shadow-card-hover transition group space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-soft text-primary-dark flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink group-hover:text-primary transition flex items-center justify-between">
              Data Quality Auditor <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Audit CSV water telemetry with automated checks that identify year-to-year jumps and mathematical population inconsistencies.
            </p>
          </Link>

          <Link
            to="/impact"
            className="p-6 bg-surface rounded-3xl border border-hairline shadow-card hover:shadow-card-hover transition group space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-normal-soft text-normal flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-base text-ink group-hover:text-primary transition flex items-center justify-between">
              ESG &amp; Savings Impact <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Review six environmental, social, and governance indicators, simulate campus savings, and track the 95%/70% scale-up trigger.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};
