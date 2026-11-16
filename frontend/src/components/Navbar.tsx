import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Droplets, Menu, X, ShieldAlert, Cpu } from 'lucide-react';
import { SimulatedDataChip } from './SimulatedDataChip';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/story', label: 'Story' },
    { to: '/research', label: 'Research' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/lab', label: 'Scenario Lab' },
    { to: '/alerts', label: 'Alerts' },
    { to: '/data-quality', label: 'Data Quality' },
    { to: '/impact', label: 'Impact' },
    { to: '/validation', label: 'Validation' },
    { to: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-cyan flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <Droplets className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg text-ink leading-tight tracking-tight">
                AquaBaseline
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                KIET · 1M1B Capstone
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink hover:bg-sky-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Status & Simulated Chip */}
          <div className="hidden sm:flex items-center gap-3">
            <SimulatedDataChip />
          </div>

          {/* Mobile hamburger */}
          <div className="flex xl:hidden items-center gap-2">
            <div className="sm:hidden">
              <SimulatedDataChip />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-ink hover:bg-sky-100 transition focus:outline-none focus:ring-2 focus:ring-cyan"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-surface border-b border-hairline px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-ink hover:bg-sky-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
