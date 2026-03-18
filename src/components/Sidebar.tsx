import { useState, useRef, useEffect } from 'react';
import { SectionId } from '../App';
import { PERIODS, PERIOD_DAYS, Period, WizardAnswers } from '../types';
import { useLanguage } from '../i18n';
import ProfileCard from './ProfileCard';

interface SidebarProps {
  activeSection: SectionId;
  selectedPeriod: Period;
  onSectionChange: (section: SectionId) => void;
  onPeriodChange: (period: Period) => void;
  isOpen: boolean;
  onClose: () => void;
  onPdfDownload: () => void;
  pdfLoading: boolean;
  wizardComplete?: boolean;
  wizardAnswers?: WizardAnswers | null;
  onEditWizard?: () => void;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDateRange(days: number): string {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export default function Sidebar({
  activeSection,
  selectedPeriod,
  onSectionChange,
  onPeriodChange,
  isOpen,
  onClose,
  onPdfDownload,
  pdfLoading,
  wizardComplete,
  wizardAnswers,
  onEditWizard,
}: SidebarProps) {
  const { t, periodLabel } = useLanguage();
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems: { id: SectionId; label: string; icon: string }[] = [
    { id: 'input', label: t.sidebar.nav.input, icon: '📊' },
    { id: 'summary', label: t.sidebar.nav.summary, icon: '🏠' },
    { id: 'tables', label: t.sidebar.nav.tables, icon: '📋' },
    { id: 'guide', label: t.sidebar.nav.guide, icon: '📖' },
  ];

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col h-full shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:z-auto md:w-56
        md:my-3 md:ml-3 md:rounded-2xl md:shadow-2xl
      `}
      style={{ backgroundColor: '#1e293b' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="#60A5FA">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <div>
            <p className="text-sm font-bold text-white leading-tight">LinkedIn</p>
            <p className="text-xs leading-tight" style={{ color: '#94a3b8' }}>{t.sidebar.analyzer}</p>
          </div>
        </div>
      </div>

      {/* Profile card */}
      {wizardComplete && wizardAnswers && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <ProfileCard answers={wizardAnswers} onEdit={onEditWizard ?? (() => {})} />
        </div>
      )}

      {/* Period selector */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#64748b' }}>
          {t.sidebar.period}
        </p>

        <div ref={periodRef} style={{ position: 'relative' }}>
          {/* Trigger button */}
          <button
            onClick={() => setPeriodOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#e2e8f0',
            }}
          >
            {periodLabel(selectedPeriod)}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: periodOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
                flexShrink: 0,
              }}
            >
              <path
                d="M2 4l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Date range below trigger */}
          <p className="text-xs mt-1.5 px-1" style={{ color: '#64748b' }}>
            {getDateRange(PERIOD_DAYS[selectedPeriod])}
          </p>

          {/* Dropdown panel — white bg for readability */}
          {periodOpen && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '100%',
                marginTop: 4,
                zIndex: 20,
              }}
              className="bg-white border border-gray-200 rounded-xl shadow-lg py-1"
            >
              {PERIODS.map((p) => {
                const active = p === selectedPeriod;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      onPeriodChange(p);
                      setPeriodOpen(false);
                      onClose();
                    }}
                    className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-gray-50 text-left"
                  >
                    <span
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: active ? '#0A66C2' : '#D1D5DB' }}
                    />
                    <div>
                      <p
                        className={`text-sm leading-snug ${
                          active ? 'font-semibold text-[#0A66C2]' : 'text-gray-700'
                        }`}
                      >
                        {periodLabel(p)}
                      </p>
                      <p className="text-xs text-gray-400">{getDateRange(PERIOD_DAYS[p])}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: '#64748b' }}>
          {t.sidebar.menu}
        </p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { onSectionChange(item.id); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeSection === item.id
                ? 'bg-[#0A66C2] text-white font-semibold'
                : 'hover:bg-white/10'
            }`}
            style={activeSection !== item.id ? { color: '#cbd5e1' } : undefined}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {activeSection === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={onPdfDownload}
          disabled={pdfLoading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#0A66C2] text-white text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pdfLoading ? t.sidebar.pdfSaving : t.sidebar.pdfSave(periodLabel(selectedPeriod))}
        </button>
        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
          by{' '}
          <a
            href="https://www.linkedin.com/in/datarichard/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: '#60A5FA' }}
          >
            Richard Lim
          </a>
        </p>
      </div>
    </aside>
  );
}
