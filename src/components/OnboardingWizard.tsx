import { useState } from 'react';
import { WizardAnswers } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  onComplete: (answers: WizardAnswers) => void;
  isEditMode?: boolean;
  onCancel?: () => void;
}

const TOTAL_STEPS = 5;

// Map from wizard step index → questions[] index (step 2 is the input step, not in questions[])
function questionIndex(step: number): number {
  if (step <= 1) return step;
  return step - 1; // steps 3,4 → questions[2,3]
}

export default function OnboardingWizard({ onComplete, isEditMode, onCancel }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState(['', '', '', '']); // 4 select steps
  const [followerCount, setFollowerCount] = useState('');

  const isInputStep = step === 2;
  const isLastStep = step === TOTAL_STEPS - 1;

  const q = !isInputStep ? t.wizard.questions[questionIndex(step)] : null;
  const fi = t.wizard.followerInput;

  // Current step has a valid answer?
  const canProceed = isInputStep
    ? followerCount.trim() !== ''
    : selections[questionIndex(step)] !== '';

  const handleSelect = (option: string) => {
    const qi = questionIndex(step);
    setSelections((prev) => {
      const next = [...prev];
      next[qi] = option;
      return next;
    });
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastStep) {
      onComplete({
        goal: selections[0],
        followerRange: selections[1],
        followerCount: followerCount.trim(),
        frequency: selections[2],
        industry: selections[3],
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  return (
    // No onClick on backdrop → modal cannot be dismissed
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md flex flex-col overflow-hidden">

        {/* Progress header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#0A66C2]">
              {t.wizard.step(step + 1, TOTAL_STEPS)}
            </span>
            {isEditMode && onCancel && (
              <button
                onClick={onCancel}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="닫기"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-[#0A66C2] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Question title + subtitle */}
        <div className="px-6 pb-4">
          <p className="text-base font-bold text-gray-900 leading-snug">
            {isInputStep ? fi.title : q!.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isInputStep ? fi.subtitle : q!.subtitle}
          </p>
        </div>

        {/* Body: options or text input */}
        <div className="px-6 pb-4">
          {isInputStep ? (
            /* Follower count text input */
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500">{fi.label}</label>
              <input
                type="text"
                inputMode="numeric"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                placeholder={fi.placeholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
              />
            </div>
          ) : (
            /* Selection option buttons */
            <div className="flex flex-col gap-2 overflow-y-auto max-h-64">
              {(q!.options as readonly string[]).map((option) => {
                const selected = selections[questionIndex(step)] === option;
                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                      selected
                        ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                        : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Back / Next / Done buttons */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {t.wizard.back}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`${step > 0 ? 'flex-1' : 'w-full'} py-3 rounded-xl text-sm font-semibold transition-colors ${
              canProceed
                ? 'bg-[#0A66C2] text-white hover:bg-[#095BA0]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastStep ? t.wizard.complete : t.wizard.next}
          </button>
        </div>
      </div>
    </div>
  );
}
