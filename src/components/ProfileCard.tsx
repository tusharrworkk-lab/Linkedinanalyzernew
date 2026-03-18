import { useState } from 'react';
import { WizardAnswers } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  answers: WizardAnswers;
  onEdit: () => void;
}

// Profile card shows: goal, exact follower count, post frequency, industry
const ANSWER_ORDER: (keyof WizardAnswers)[] = ['goal', 'followerCount', 'frequency', 'industry'];

export default function ProfileCard({ answers, onEdit }: Props) {
  const { t, language } = useLanguage();
  const { profileCard } = t.wizard;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header — entire row is clickable toggle */}
      <div
        className="bg-[#0A66C2] px-3 py-2 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen((o) => !o)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="text-white font-semibold text-xs truncate">{profileCard.title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Chevron — rotates when open */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Edit button — stopPropagation prevents toggling collapse */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-white/80 hover:text-white text-xs font-medium underline underline-offset-2 transition-colors"
          >
            {profileCard.edit}
          </button>
        </div>
      </div>

      {/* Answer rows — only when expanded */}
      {isOpen && (
        <div className="divide-y divide-gray-50">
          {ANSWER_ORDER.map((key, i) => (
            <div key={key} className="flex items-start justify-between px-3 py-2 gap-2">
              <span className="text-xs text-gray-400 font-medium flex-shrink-0">{profileCard.labels[i]}</span>
              <span className="text-xs text-gray-800 font-semibold text-right leading-snug">
                {key === 'followerCount' && language === 'ko'
                  ? `${answers[key]}명`
                  : answers[key]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
