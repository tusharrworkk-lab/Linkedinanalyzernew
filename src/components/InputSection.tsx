import { useState } from 'react';
import { InputData, Period, MetricKey } from '../types';
import InputForm from './InputForm';
import ApiIntegration from './ApiIntegration';
import { useLanguage } from '../i18n';

interface VideoCardProps {
  title: string;
  description: string;
  comingSoon: string;
  watchLabel: string;
  href?: string;
}

function VideoCard({ title, description, comingSoon, watchLabel, href = '#' }: VideoCardProps) {
  const isTBD = href === '#';

  return (
    <a
      href={href}
      target={isTBD ? undefined : '_blank'}
      rel="noopener noreferrer"
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all group ${
        isTBD
          ? 'bg-gray-50 border-gray-100 cursor-default'
          : 'bg-white border-gray-200 hover:border-[#0A66C2] hover:shadow-md'
      }`}
    >
      {/* YouTube-style thumbnail */}
      <div className="relative flex-shrink-0 w-20 h-14 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        {isTBD && (
          <div className="absolute inset-0 bg-gray-300/60 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500">TBD</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        {isTBD ? (
          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            {comingSoon}
          </span>
        ) : (
          <span className="inline-flex items-center mt-1.5 text-xs text-[#0A66C2] font-medium group-hover:underline">
            {watchLabel}
          </span>
        )}
      </div>
    </a>
  );
}

interface InputSectionProps {
  data: InputData;
  onUpdate: (period: Period, key: MetricKey, value: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
  onFetchData: (token: string, urn: string) => void;
  isLoading: boolean;
  error: string | null;
}

const todayStr = new Date().toISOString().slice(0, 10);

export default function InputSection({
  data,
  onUpdate,
  onLoadExample,
  onReset,
  onFetchData,
  isLoading,
  error,
}: InputSectionProps) {
  const { t } = useLanguage();
  const [guideOpen, setGuideOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videos = t.input.videos;
  const totalSlides = videos.length;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.input.pageTitle}</h1>
        <p className="text-xs text-gray-400 mt-0.5">{todayStr}</p>
        <p className="text-sm text-gray-500 mt-1">{t.input.pageDesc}</p>
        {/* Guide trigger button */}
        <button
          onClick={() => setGuideOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold hover:bg-[#E8F1FB] transition-colors"
        >
          {t.input.videoGuideButton}
        </button>
      </div>

      {/* Auto Fetch API Intergration */}
      <ApiIntegration 
        onFetchData={onFetchData} 
        isLoading={isLoading} 
        error={error} 
      />

      {/* Input table */}
      <InputForm
        data={data}
        onUpdate={onUpdate}
        onLoadExample={onLoadExample}
        onReset={onReset}
      />

      {/* Guide modal */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-[#0A66C2] px-5 py-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎬</span> {t.input.videoGuideTitle}
                </h2>
                <p className="text-blue-100 text-sm mt-0.5">{t.input.videoGuideDesc}</p>
              </div>
              <button
                onClick={() => setGuideOpen(false)}
                className="flex-shrink-0 ml-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="닫기"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Carousel */}
            <div className="p-5">
              <div className="overflow-hidden">
                <VideoCard
                  title={videos[currentSlide].title}
                  description={videos[currentSlide].description}
                  comingSoon={t.input.comingSoon}
                  watchLabel={t.input.watchYoutube}
                  href="#"
                />
              </div>

              {/* Carousel controls */}
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  disabled={currentSlide === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label={t.input.prevSlide}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="flex items-center gap-1.5">
                  {videos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`rounded-full transition-all ${
                        i === currentSlide
                          ? 'w-4 h-2 bg-[#0A66C2]'
                          : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                      }`}
                      aria-label={t.input.slideN(i + 1)}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
                  disabled={currentSlide === totalSlides - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label={t.input.nextSlide}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-2">
                {currentSlide + 1} / {totalSlides}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
