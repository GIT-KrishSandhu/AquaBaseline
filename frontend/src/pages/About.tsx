import React from 'react';
import {
  User,
  GraduationCap,
  Sparkles,
  Bot,
  AlertTriangle,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-soft text-primary-dark inline-block">
          Transparency &amp; Student Profile
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-heading">
          About AquaBaseline &amp; Academic Disclosure
        </h1>
        <p className="text-sm text-ink-muted max-w-3xl">
          Complete project provenance, author background, AI tools disclosure, operational assumptions, and honest student learnings from the 1M1B internship.
        </p>
      </div>

      {/* Author & Internship Bio Card */}
      <div className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan text-white flex items-center justify-center font-bold text-xl shadow-sm">
              KS
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink font-heading">Krish Sandhu</h2>
              <p className="text-xs text-ink-muted">
                Student Innovator · KIET Group of Institutions, Uttar Pradesh, India
              </p>
              <p className="text-xs text-primary font-medium mt-0.5">krishsandhu21@gmail.com</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="px-3 py-1 rounded-full bg-normal-soft text-normal font-bold text-xs inline-block">
              1M1B Applied AI Intern
            </span>
            <p className="text-xs text-ink-muted">Green Skills &amp; Applied AI for Climate Action</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-ink-muted">
          <div>
            <span className="font-bold text-ink text-sm block mb-1">Academic Program</span>
            <p className="leading-relaxed">
              1M1B (1 Million for 1 Billion) in partnership with Microsoft, MeitY Startup Hub, and the Government of Uttar Pradesh / Pragya.
            </p>
          </div>
          <div>
            <span className="font-bold text-ink text-sm block mb-1">Simulated Org &amp; Mentors</span>
            <p className="leading-relaxed">
              Work simulated at SustainAI (HyperShiftAI Solutions Pvt. Ltd.). Guided by project managers Rohit Mehta and Manas Tripathi.
            </p>
          </div>
          <div>
            <span className="font-bold text-ink text-sm block mb-1">Capstone Focus Area</span>
            <p className="leading-relaxed">
              Sustainable Water Management, Anomaly Detection, ESG Governance, and Campus Climate Action.
            </p>
          </div>
        </div>
      </div>

      {/* AI Tools Disclosure */}
      <div className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-6">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-ink font-heading">
            Ethical Disclosure: AI Tools &amp; Machine Learning Used
          </h2>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          In strict accordance with the 1M1B submission guidelines, all artificial intelligence algorithms and generative AI assistants used during the research, design, and engineering of this capstone are explicitly disclosed:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-sky-50 border border-hairline space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Technical Machine Learning Architecture
            </div>
            <ul className="text-xs text-ink space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Isolation Forest (scikit-learn):</strong> Unsupervised anomaly detection algorithm fitted per building on hourly features (<code className="font-mono">rel</code>, <code className="font-mono">flow</code>, <code className="font-mono">hour</code>) to separate leaks from daytime lunch peaks.
              </li>
              <li>
                <strong>Scientific Python Stack:</strong> Pandas, NumPy, and SciPy used for empirical rolling IQR baselines, 20-seed validation simulation, and CSV data auditing.
              </li>
              <li>
                <strong>Full-Stack Frameworks:</strong> FastAPI for asynchronous Python REST API; React 18, Vite, Tailwind CSS, and Recharts for interactive user interface.
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50 border border-hairline space-y-3">
            <div className="flex items-center gap-2 text-cyan font-bold text-sm">
              <Bot className="w-4 h-4" /> AI Assistants Used in the Student Journey
            </div>
            <ul className="text-xs text-ink space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Claude (Anthropic):</strong> Used during the 8-week internship assignments for ideation, drafting structured technical notes, designing slide presentation artifacts, and exploratory Jupyter notebooks.
              </li>
              <li>
                <strong>Google Antigravity:</strong> Used as the senior full-stack agent to scaffold, test, refine, and verify the production-grade React + FastAPI web application and generate final portfolio assets.
              </li>
              <li>
                <strong>Student Authorship:</strong> The student (Krish Sandhu) reviewed, validated, and edited all code, text, and slide materials to ensure genuine authenticity.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Assumptions & Limitations */}
      <div className="bg-surface rounded-3xl p-8 border border-hairline shadow-card space-y-4">
        <div className="flex items-center gap-2 text-watch">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-xl font-bold text-ink font-heading">
            Assumptions &amp; Known Limitations
          </h2>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Honesty is non-negotiable in scientific research. The following limitations are acknowledged:
        </p>
        <ul className="text-xs text-ink space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Simulated Meter Streams:</strong> No physical flow meters have been permanently installed on the KIET campus yet. All 15-minute readings are generated by a validated statistical simulator.
          </li>
          <li>
            <strong>Planning Assumptions:</strong> Baseline water consumption (276 L/person/day), leak losses (12%), campus population (5,000), and water savings are planning hypotheses to be validated in field pilots.
          </li>
          <li>
            <strong>Synthetic Public Dataset:</strong> The Kaggle global water consumption dataset used in the Research page appears synthetic (as proven by the ~5B implied population check). Findings describe patterns in the dataset, not real countries.
          </li>
          <li>
            <strong>Facilities Validation:</strong> While alert workflows were designed around institutional needs, direct feedback from the campus facilities management team remains the next active milestone.
          </li>
        </ul>
      </div>

      {/* Student Journey & Honest Learnings */}
      <div className="bg-sky-50 rounded-3xl p-8 border border-hairline space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-xl font-bold text-ink font-heading">
            Student Journey &amp; Core Learnings
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-surface rounded-2xl border border-hairline space-y-1.5">
            <span className="font-bold text-ink block">1. Flat results are still findings</span>
            <p className="text-ink-muted leading-relaxed">
              Discovering global per-capita water use was flat (+0.6%) across 25 years taught me not to force a narrative on data. Real climate engineering requires working with empirical facts, even when they lack dramatic upward curves.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-hairline space-y-1.5">
            <span className="font-bold text-ink block">2. Hour-awareness is non-negotiable</span>
            <p className="text-ink-muted leading-relaxed">
              An early prototype ignored hour-of-day and missed 100% of simulated leaks because a 1,000 L/h night leak is smaller than a 3,000 L/h lunchtime peak. Introducing relative hourly scaling solved the problem instantly.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-hairline space-y-1.5">
            <span className="font-bold text-ink block">3. Static thresholds fail silently</span>
            <p className="text-ink-muted leading-relaxed">
              Testing the traditional daily-total IQR rule caught 0 of 60 leak nights. Because a 2-hour leak adds only ~4–14% to total daily inflow, it gets completely masked by normal student schedule variance.
            </p>
          </div>

          <div className="p-4 bg-surface rounded-2xl border border-hairline space-y-1.5">
            <span className="font-bold text-ink block">4. Integrity audits before model training</span>
            <p className="text-ink-muted leading-relaxed">
              Uncovering the implied 5-billion population anomaly in Kaggle data taught me that clean CSV formatting does not guarantee physical sanity. Automated sanity rules must precede machine learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

