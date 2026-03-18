import { PERIODS, InputData, Period, MetricKey } from '../types';
import { useLanguage } from '../i18n';

interface InputFormProps {
  data: InputData;
  onUpdate: (period: Period, key: MetricKey, value: string) => void;
  onLoadExample: () => void;
  onReset: () => void;
}

export default function InputForm({ data, onUpdate, onLoadExample, onReset }: InputFormProps) {
  const { t, metricInfo, periodLabel } = useLanguage();

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white">{t.input.formTitle}</h2>
          <p className="text-blue-100 text-sm mt-0.5 hidden sm:block">
            {t.input.formDesc}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onLoadExample}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-[#0A66C2] text-xs md:text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            {t.input.loadExample}
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-blue-800 transition-colors"
          >
            {t.input.reset}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="sticky left-0 z-10 bg-gray-50 text-left px-6 py-3 text-sm font-semibold text-gray-600 min-w-[190px]">
                {t.input.metricHeader}
              </th>
              {PERIODS.map((period) => (
                <th
                  key={period}
                  className="px-4 py-3 text-center text-sm font-semibold text-gray-600 min-w-[100px]"
                >
                  {periodLabel(period)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricInfo.map((metric, idx) => {
              const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';
              const stickyBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              return (
                <tr
                  key={metric.key}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${rowBg}`}
                >
                  <td className={`sticky left-0 z-10 px-6 py-3 border-r border-gray-100 ${stickyBg}`}>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: metric.color }}
                      />
                      <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{metric.label}</span>
                    </div>
                  </td>
                  {PERIODS.map((period) => (
                    <td key={period} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={data[period][metric.key] ?? ''}
                        onChange={(e) => onUpdate(period, metric.key, e.target.value)}
                        placeholder="—"
                        className="w-full min-w-[80px] text-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent placeholder:text-gray-300 transition-all"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {t.input.tip}
        </p>
      </div>
    </section>
  );
}
