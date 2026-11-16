import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Info, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-hairline mt-20 pt-12 pb-8 text-xs text-ink-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base text-ink">
                AquaBaseline
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-soft text-primary font-semibold text-[10px]">
                Prototype
              </span>
            </div>
            <p className="text-ink-muted leading-relaxed max-w-md">
              Smart Water Monitoring That Learns What "Normal" Looks Like. Capstone project for the 1M1B Green Skills and Applied AI for Climate Action internship.
            </p>
            <div className="flex items-center gap-2 text-ink text-xs font-medium">
              <span>Author: Krish Sandhu</span>
              <span>·</span>
              <span>KIET Group of Institutions, UP, India</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] mb-3">
              Application Navigation
            </h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-primary transition">Live Dashboard</Link></li>
              <li><Link to="/lab" className="hover:text-primary transition">Scenario Lab</Link></li>
              <li><Link to="/alerts" className="hover:text-primary transition">Alerts & Feedback</Link></li>
              <li><Link to="/data-quality" className="hover:text-primary transition">Data Quality Auditor</Link></li>
              <li><Link to="/impact" className="hover:text-primary transition">ESG & Impact Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-ink uppercase tracking-wider text-[11px] mb-3">
              Transparency & Ethics
            </h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary transition">AI Tools Disclosed</Link></li>
              <li><Link to="/validation" className="hover:text-primary transition">Empirical Validation</Link></li>
              <li><Link to="/research" className="hover:text-primary transition">Research & Insights</Link></li>
              <li><Link to="/story" className="hover:text-primary transition">Student Journey</Link></li>
            </ul>
          </div>
        </div>

        {/* Persistent Honesty Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-sky-50 border border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-ink leading-normal">
              <strong>Simulated Data Disclaimer:</strong> All meter readings, campus baselines, and cost/volume savings in this application are simulated and assumed for prototype validation. Real hardware integration and facilities team validation are the next planned steps.
            </span>
          </div>
          <Link
            to="/about"
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface border border-hairline hover:border-primary text-ink hover:text-primary font-semibold text-xs transition"
          >
            Read Disclosure
          </Link>
        </div>

        <div className="pt-4 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© 2026 AquaBaseline · Krish Sandhu · 1M1B Climate Action Internship</span>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:underline">Methodology & Limitations</Link>
            <Link to="/validation" className="hover:underline">Validation Metrics</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

