import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Droplet,
  Compass,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const Story: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('problem');

  const sections = [
    { id: 'problem', title: "1. What's the problem?" },
    { id: 'discovery', title: '2. What did I discover?' },
    { id: 'solution', title: '3. What am I building?' },
    { id: 'prototype', title: '4. Prototype & Application' },
    { id: 'outcomes', title: '5. Outcomes & Impact' },
    { id: 'next', title: "6. What's next?" },
  ];

  // Intersection observer or scroll listener for progress rail
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Progress Rail (Desktop) */}
        <aside className="hidden lg:block col-span-1">
          <div className="sticky top-24 space-y-3 bg-surface p-5 rounded-3xl border border-hairline shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted block">
              Student Journey Rail
            </span>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    activeSection === s.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-sky-50'
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                  {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="col-span-1 lg:col-span-3 space-y-12">
          {/* Header */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-soft text-primary-dark inline-block">
              1M1B Capstone Journey
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-heading">
              AquaBaseline: The Story Behind the Prototype
            </h1>
            <p className="text-sm text-ink-muted">
              By Krish Sandhu (KIET Group of Institutions, Uttar Pradesh) · Sustainable Water &amp; Applied AI
            </p>
          </div>

          {/* Section 1: Problem */}
          <section id="problem" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span>Section 1</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              1. What's the problem?
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              Water in institutions, residential complexes, and commercial buildings is almost universally tracked as coarse monthly or yearly utility totals. When a hidden underground pipe fractures, a toilet tank cistern flapper leaks continuously, or a sensor goes stuck, the fault is completely invisible in gross monthly summaries. Facility managers, institutions, and residents lose clean water, municipal funds, and confidence in environmental metrics.
            </p>
            <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-2 text-xs text-ink-muted">
              <span className="font-bold text-ink block">What Inspired Krish:</span>
              <p>
                "While cleaning and analyzing a Kaggle global water consumption dataset in Assignment 2A, I discovered that superficial checks showed zero missing cells, yet comparing total volume with per-capita daily use revealed an internal mathematical impossibility—it implied roughly 5 billion people per country! Italy 2004, for example, showed 124.7 L/person/day alongside a staggering 604.7 Billion Cubic Metre gross total. Nothing in the dataset flagged this discrepancy. It became clear that without automated, domain-aware integrity checks and high-resolution tracking, errors and losses thrive undetected."
              </p>
            </div>
          </section>

          {/* Section 2: Discovery */}
          <section id="discovery" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-cyan font-bold text-xs uppercase tracking-wider">
              <span>Section 2</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              2. What did I discover?
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              Evaluating 500 country-year records across 20 nations (2000–2024) revealed three counter-intuitive statistical truths:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-1">
                <span className="font-bold text-ink text-xs block">Flat Macro Average</span>
                <span className="text-xs text-ink-muted">
                  Per-person use barely moved: 282.1 L/day (2000) to 283.8 L/day (2024), a change of only +0.6%.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-1">
                <span className="font-bold text-ink text-xs block">Internal Swing &gt; Gap</span>
                <span className="text-xs text-ink-muted">
                  The gap between highest (India 295 L) and lowest (Indonesia 266 L) is 30 L/day, but a single country's year-to-year swing averages 42 L/day!
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-hairline space-y-1">
                <span className="font-bold text-ink text-xs block">Narrow Normal Band</span>
                <span className="text-xs text-ink-muted">
                  91% of records clustered tightly between 200–350 L/day; only 8 of 500 were statistical extremes.
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-primary-soft/60 border border-primary/20 text-xs text-ink">
              <strong>The Key Insight:</strong> Because internal variation within a unit exceeds the gap between units, <em>one universal fixed threshold cannot distinguish an operational fault from normal routine fluctuation.</em> Every building must learn its own baseline normal, and data must be checked continuously.
            </div>
          </section>

          {/* Section 3: What am I building? */}
          <section id="solution" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-normal font-bold text-xs uppercase tracking-wider">
              <span>Section 3</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              3. What am I building?
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              <strong>AquaBaseline</strong> is an AI-powered smart water monitoring platform designed for campuses and commercial facilities.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <strong>High-Resolution Telemetry:</strong> Log building inlet flow every 15 minutes using non-invasive pulse or ultrasonic meters.
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <strong>Per-Capita Normalization:</strong> Convert gross volume to Litres per Person per Day using attendance and hostel headcount registries.
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <strong>Hour-Aware Isolation Forest:</strong> Unsupervised machine learning learns each building's diurnal rhythm by hour-of-day. Ratios relative to hourly median separate true night leaks from daytime lunch peaks.
                </div>
              </div>
              <div className="flex items-start gap-3 text-xs text-ink">
                <div className="w-6 h-6 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <strong>Human-in-the-Loop Feedback:</strong> Alerts notify the facility manager with plain-language reasons. Plumber verification (Real leak / False alarm / Meter error) trains the model and retunes sensitivity.
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Prototype & Application */}
          <section id="prototype" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-watch font-bold text-xs uppercase tracking-wider">
              <span>Section 4</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              4. Prototype &amp; Practical Application
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              The live interactive prototype is organized into focused operational tools for different campus stakeholders:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                to="/dashboard"
                className="p-4 rounded-2xl bg-sky-50 border border-hairline hover:border-primary transition group space-y-1.5"
              >
                <span className="font-bold text-sm text-ink group-hover:text-primary flex items-center justify-between">
                  Facility Dashboard <ArrowRight className="w-4 h-4" />
                </span>
                <p className="text-xs text-ink-muted">
                  View building KPIs, hourly flow waveforms with shaded normal bands, and replay timelines.
                </p>
              </Link>

              <Link
                to="/lab"
                className="p-4 rounded-2xl bg-sky-50 border border-hairline hover:border-primary transition group space-y-1.5"
              >
                <span className="font-bold text-sm text-ink group-hover:text-primary flex items-center justify-between">
                  Scenario Lab <ArrowRight className="w-4 h-4" />
                </span>
                <p className="text-xs text-ink-muted">
                  Inject night leaks, tank overflows, and sensor faults to compare AI detection against static rules.
                </p>
              </Link>

              <Link
                to="/alerts"
                className="p-4 rounded-2xl bg-sky-50 border border-hairline hover:border-primary transition group space-y-1.5"
              >
                <span className="font-bold text-sm text-ink group-hover:text-primary flex items-center justify-between">
                  Alerts &amp; Feedback Loop <ArrowRight className="w-4 h-4" />
                </span>
                <p className="text-xs text-ink-muted">
                  Review anomaly incident cards, submit maintenance feedback, and adjust model sensitivity.
                </p>
              </Link>

              <Link
                to="/data-quality"
                className="p-4 rounded-2xl bg-sky-50 border border-hairline hover:border-primary transition group space-y-1.5"
              >
                <span className="font-bold text-sm text-ink group-hover:text-primary flex items-center justify-between">
                  Data Quality Auditor <ArrowRight className="w-4 h-4" />
                </span>
                <p className="text-xs text-ink-muted">
                  Upload raw CSV telemetry to run automated governance tests including jump and population checks.
                </p>
              </Link>
            </div>
          </section>

          {/* Section 5: Outcomes & Impact */}
          <section id="outcomes" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-alert font-bold text-xs uppercase tracking-wider">
              <span>Section 5</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              5. Outcomes &amp; Empirical Impact
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              Validation experiments across 20 simulation seeds (60 leak nights per building) empirically confirmed:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-normal-soft border border-normal/30 space-y-1">
                <span className="font-extrabold text-2xl text-normal tabular-nums">80–85%</span>
                <span className="font-bold text-ink block">Night Leak Recall</span>
                <span className="text-ink-muted">
                  Caught overnight pipe leaks with only 1.2–2.5% false alert days.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-alert-soft border border-alert/30 space-y-1">
                <span className="font-extrabold text-2xl text-alert tabular-nums">0%</span>
                <span className="font-bold text-ink block">Daily Total Rule</span>
                <span className="text-ink-muted">
                  Fixed IQR threshold missed 100% of leaks because the leak added only 4–14% to gross daily total.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-cyan-soft border border-cyan/30 space-y-1">
                <span className="font-extrabold text-2xl text-ink tabular-nums">~50M L</span>
                <span className="font-bold text-ink block">Conserved Annually</span>
                <span className="text-ink-muted">
                  Projected savings for 5,000 campus population under a 10% reduction target (assumed).
                </span>
              </div>
            </div>
          </section>

          {/* Section 6: What's next? */}
          <section id="next" className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span>Section 6</span>
            </div>
            <h2 className="text-2xl font-bold text-ink font-heading">
              6. What's next?
            </h2>
            <p className="text-sm text-ink leading-relaxed">
              Moving AquaBaseline from a validated simulation prototype to physical campus deployment:
            </p>
            <ul className="text-xs text-ink space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Hardware Pilot:</strong> Seek campus administrative permission to install clamp-on ultrasonic pulse meters on 3 pilot buildings (Hostel Block A, Canteen, Academic Block B).
              </li>
              <li>
                <strong>Facilities Alignment:</strong> Review alerts with the KIET facilities management and plumbing crew to replace assumed baseline numbers with empirical field measurements.
              </li>
              <li>
                <strong>Open Science:</strong> Open-source the codebase on GitHub and publish the data governance audit methodology for other academic institutions.
              </li>
            </ul>
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white font-semibold text-xs transition"
              >
                Explore Live Prototype
              </Link>
              <Link
                to="/validation"
                className="px-5 py-2.5 rounded-full bg-sky-50 hover:bg-sky-100 text-ink font-semibold text-xs border border-hairline transition"
              >
                Review Validation Results
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

