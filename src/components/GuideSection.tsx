import { useLanguage } from '../i18n';

interface GuideSectionProps {
  hypotheses: string[];
  onHypothesisChange: (index: number, value: string) => void;
}

export default function GuideSection({ hypotheses, onHypothesisChange }: GuideSectionProps) {
  const { t, metricInfo, conversionRateInfo } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.guide.pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.guide.pageDesc}</p>
      </div>

      {/* Metric descriptions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-base font-bold text-white">{t.guide.metricsTitle}</h2>
        </div>
        <div className="p-6 space-y-3">
          {metricInfo.map((m) => (
            <div key={m.key} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <span
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: m.color }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion rate descriptions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-base font-bold text-white">{t.guide.conversionTitle}</h2>
        </div>
        <div className="p-6 space-y-3">
          {conversionRateInfo.map((info) => (
            <div key={info.key} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <span
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: info.color }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">{info.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action items — keep existing blue-tinted style */}
      <div className="bg-[#E8F1FB] rounded-2xl border border-blue-100 p-6">
        <h2 className="text-sm font-bold text-[#0A66C2] mb-4 flex items-center gap-2">
          {t.guide.actionTitle}
        </h2>
        <ul className="space-y-2">
          {t.guide.actionItems.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="text-[#0A66C2] mt-0.5 font-bold">→</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Hypotheses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-base font-bold text-white">{t.guide.hypothesisTitle}</h2>
          <p className="text-blue-100 text-sm mt-0.5">{t.guide.hypothesisDesc}</p>
        </div>
        <div className="p-6 space-y-3">
          {hypotheses.map((h, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A66C2] text-white text-xs font-bold flex items-center justify-center mt-1">
                {idx + 1}
              </span>
              <textarea
                value={h}
                onChange={(e) => onHypothesisChange(idx, e.target.value)}
                placeholder={t.guide.hypothesisPlaceholder(idx + 1)}
                rows={2}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
