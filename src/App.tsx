import { useState, useRef } from 'react';
import { InputData, PERIODS, PERIOD_DAYS, EMPTY_METRIC, EXAMPLE_DATA, Period, MetricKey, WizardAnswers } from './types';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import OnboardingWizard from './components/OnboardingWizard';
import SummarySection from './components/SummarySection';
import TablesSection from './components/TablesSection';
import GuideSection from './components/GuideSection';
import { exportToPdf } from './utils/exportPdf';
import { LanguageProvider, LanguageTab, LanguageSelectScreen, useLanguage } from './i18n';

export type SectionId = 'input' | 'summary' | 'tables' | 'guide';

const createEmptyInputData = (): InputData =>
  PERIODS.reduce((acc, p) => {
    acc[p] = { ...EMPTY_METRIC };
    return acc;
  }, {} as InputData);

function AppInner() {
  const { t, periodLabel } = useLanguage();
  const [inputData, setInputData] = useState<InputData>(createEmptyInputData());
  const [activeSection, setActiveSection] = useState<SectionId>('input');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7일');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [hypotheses, setHypotheses] = useState<string[]>(['', '', '']);
  const [wizardComplete, setWizardComplete] = useState<boolean>(
    () => localStorage.getItem('wizardComplete') === 'true'
  );
  const [wizardAnswers, setWizardAnswers] = useState<WizardAnswers | null>(
    () => {
      const stored = localStorage.getItem('wizardAnswers');
      return stored ? JSON.parse(stored) : null;
    }
  );
  const [isWizardEditMode, setIsWizardEditMode] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchData = async (token: string, urn: string) => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const today = new Date();
      // Need a deep clone using JSON to avoid mutating React state
      const updatedData: InputData = JSON.parse(JSON.stringify(inputData));

      for (const p of PERIODS) {
        const days = PERIOD_DAYS[p];
        const start = new Date(today);
        start.setDate(today.getDate() - days);
        const end = today;

        const startObj = { startYear: start.getFullYear(), startMonth: start.getMonth() + 1, startDay: start.getDate() };
        const endObj = { endYear: end.getFullYear(), endMonth: end.getMonth() + 1, endDay: end.getDate() };

        const res = await fetch(
            `http://localhost:3001/api/linkedin/analytics?token=${token}&urn=${encodeURIComponent(urn)}&startDate=${JSON.stringify(startObj)}&endDate=${JSON.stringify(endObj)}&queryType=REACTION`
        );
        
        if (!res.ok) {
           const errData = await res.json();
           throw new Error(errData.error || 'Fetch failed');
        }
        
        const data = await res.json();
        
        let totalReactions = 0;
        if (data.elements && data.elements.length > 0) {
            totalReactions = data.elements.reduce((acc: number, el: any) => {
                const val = el.totalEngagements || el.value || 0; 
                return acc + val;
            }, 0);
        }

        updatedData[p].engagement = totalReactions > 0 ? totalReactions : null;
      }
      
      setInputData(updatedData);
    } catch (e: any) {
      setFetchError(e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleWizardComplete = (answers: WizardAnswers) => {
    localStorage.setItem('wizardComplete', 'true');
    localStorage.setItem('wizardAnswers', JSON.stringify(answers));
    setWizardAnswers(answers);
    setWizardComplete(true);
    setIsWizardEditMode(false);
  };
  const handleEditWizard = () => { setWizardComplete(false); setIsWizardEditMode(true); };
  const handleCancelEditWizard = () => { setWizardComplete(true); setIsWizardEditMode(false); };

  const handleUpdate = (period: Period, key: MetricKey, value: string) => {
    const num = value === '' ? null : Number(value);
    setInputData((prev) => ({
      ...prev,
      [period]: {
        ...prev[period],
        [key]: num !== null && !isNaN(num) ? num : null,
      },
    }));
  };

  const handleLoadExample = () => setInputData(EXAMPLE_DATA);
  const handleReset = () => setInputData(createEmptyInputData());

  const handleHypothesisChange = (index: number, value: string) => {
    setHypotheses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    try {
      await exportToPdf(pdfContainerRef, selectedPeriod);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:flex md:h-screen bg-gray-50 md:overflow-hidden">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center px-4 h-14 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label={t.app.menuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="text-sm font-bold text-gray-900">{t.app.title}</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeSection={activeSection}
        selectedPeriod={selectedPeriod}
        onSectionChange={setActiveSection}
        onPeriodChange={setSelectedPeriod}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onPdfDownload={handlePdfDownload}
        pdfLoading={pdfLoading}
        wizardComplete={wizardComplete}
        wizardAnswers={wizardAnswers}
        onEditWizard={handleEditWizard}
      />

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {/* Language tab — fixed on mobile (below header), sticky on desktop */}
        <div className="fixed top-14 left-0 right-0 z-20 md:sticky md:top-0 md:left-auto md:right-auto bg-white border-b border-gray-100 flex justify-center py-2 shadow-sm">
          <LanguageTab />
        </div>
        {/* Spacer on mobile: pushes content below the fixed language bar (~44px) */}
        <div className="h-11 md:hidden" />
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-6 md:py-8">
          {activeSection === 'input' && (
            <InputSection
              data={inputData}
              onUpdate={handleUpdate}
              onLoadExample={handleLoadExample}
              onReset={handleReset}
              onFetchData={handleFetchData}
              isLoading={isFetching}
              error={fetchError}
            />
          )}
          {activeSection === 'summary' && (
            <SummarySection data={inputData} selectedPeriod={selectedPeriod} />
          )}
          {activeSection === 'tables' && (
            <TablesSection data={inputData} selectedPeriod={selectedPeriod} />
          )}
          {activeSection === 'guide' && (
            <GuideSection
              hypotheses={hypotheses}
              onHypothesisChange={handleHypothesisChange}
            />
          )}
        </div>
      </main>

      {/* Loading overlay during PDF generation */}
      {pdfLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(249,250,251,0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>{t.app.pdfGenerating}</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{t.app.pdfWait}</p>
        </div>
      )}

      {/* Onboarding wizard — shown until user completes all 5 steps */}
      {!wizardComplete && (
        <OnboardingWizard
          onComplete={handleWizardComplete}
          isEditMode={isWizardEditMode}
          onCancel={isWizardEditMode ? handleCancelEditWizard : undefined}
        />
      )}

      {/* PDF capture container — position:fixed bypasses md:overflow-hidden clipping */}
      <div
        ref={pdfContainerRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '900px',
          backgroundColor: '#F9FAFB',
          padding: '0 32px 32px',
          pointerEvents: 'none',
          opacity: 0,
          zIndex: -1,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* PDF header — rendered as HTML so browser fonts handle Korean/English correctly */}
          <div style={{ background: '#0A66C2', borderRadius: 16, padding: '16px 24px 20px', marginBottom: -16 }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0 }}>
              LinkedIn Analytics — {periodLabel(selectedPeriod)}
            </p>
            <p style={{ color: '#BFDBFE', fontSize: 12, marginTop: 6, margin: '6px 0 0' }}>
              {t.app.pdfDateLabel}: {new Date().toISOString().slice(0, 10)}
            </p>
          </div>
          <SummarySection data={inputData} selectedPeriod={selectedPeriod} />
          <TablesSection data={inputData} selectedPeriod={selectedPeriod} pdfMode={true} />
          <GuideSection
            hypotheses={hypotheses}
            onHypothesisChange={handleHypothesisChange}
          />
        </div>
      </div>
    </div>
  );
}

function AppRoot() {
  const { hasSelected } = useLanguage();
  if (!hasSelected) return <LanguageSelectScreen />;
  return <AppInner />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AppRoot />
    </LanguageProvider>
  );
}
