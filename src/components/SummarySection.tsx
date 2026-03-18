import { InputData, Period, FUNNEL_METRICS, PERIOD_DAYS } from '../types';
import { calcDailyMetrics, calcConversionRates, formatNumber, formatRate } from '../calculations';
import { useLanguage } from '../i18n';

interface Props {
  data: InputData;
  selectedPeriod: Period;
}

function SummaryCards({ data, selectedPeriod }: Props) {
  const { t, metricInfo, periodLabel } = useLanguage();
  const d = data[selectedPeriod];
  const daily = calcDailyMetrics(d, selectedPeriod);

  const impressionsMeta = metricInfo.find((m) => m.key === 'impressions')!;
  const memberReachMeta = metricInfo.find((m) => m.key === 'memberReach')!;
  const engagementMeta = metricInfo.find((m) => m.key === 'engagement')!;
  const followerGrowthMeta = metricInfo.find((m) => m.key === 'followerGrowth')!;

  const cards = [
    {
      label: impressionsMeta.label,
      value: formatNumber(d.impressions),
      sub: t.summary.dailyAvg(formatNumber(daily.impressions)),
      color: '#0A66C2',
      bg: 'bg-blue-50',
      icon: '👁',
    },
    {
      label: memberReachMeta.label,
      value: formatNumber(d.memberReach),
      sub: t.summary.dailyAvg(formatNumber(daily.memberReach)),
      color: '#5CB8E4',
      bg: 'bg-cyan-50',
      icon: '📡',
    },
    {
      label: engagementMeta.label,
      value: formatNumber(d.engagement),
      sub: t.summary.dailyAvg(formatNumber(daily.engagement)),
      color: '#F59E0B',
      bg: 'bg-amber-50',
      icon: '💬',
    },
    {
      label: followerGrowthMeta.label,
      value: formatNumber(d.followerGrowth),
      sub: t.summary.dailyAvg(formatNumber(daily.followerGrowth)),
      color: '#8B5CF6',
      bg: 'bg-purple-50',
      icon: '👥',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`${card.bg} rounded-2xl p-4 md:p-5 border border-white shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: card.color }}
            >
              {t.summary.periodBadge(PERIOD_DAYS[selectedPeriod])}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1">{card.label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

function FunnelViz({ data, selectedPeriod }: Props) {
  const { t, metricInfo, periodLabel } = useLanguage();
  const d = data[selectedPeriod];
  const rates = calcConversionRates(d);
  const funnelItems = FUNNEL_METRICS.map((key) => metricInfo.find((m) => m.key === key)!);
  const maxVal = Math.max(...funnelItems.map((m) => d[m.key] ?? 0), 1);

  const rateLabels: Partial<Record<string, string>> = {
    memberReach: formatRate(rates.memberReachRate),
    engagement: formatRate(rates.engagementRate),
    profileViews: formatRate(rates.profileViewRate),
    followerGrowth: formatRate(rates.followerConversionRate),
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4">
        <h3 className="text-base font-bold text-white">{t.summary.funnelTitle}</h3>
        <p className="text-blue-100 text-sm mt-0.5">{t.summary.funnelDesc(periodLabel(selectedPeriod))}</p>
      </div>
      <div className="p-6">
      <div className="space-y-3">
        {funnelItems.map((metric, idx) => {
          const val = d[metric.key];
          const widthPct = val !== null ? Math.max((val / maxVal) * 100, 2) : 0;
          return (
            <div key={metric.key} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 w-4 text-center">{idx + 1}</span>
              <span className="text-sm font-medium text-gray-700 w-20 md:w-28 flex-shrink-0">
                {metric.label}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: metric.color }}
                >
                  {widthPct > 18 && val !== null && (
                    <span className="text-xs font-semibold text-white">{formatNumber(val)}</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-800 w-20 text-right tabular-nums">
                {val !== null ? formatNumber(val) : <span className="text-gray-300">—</span>}
              </span>
              {idx > 0 && rateLabels[metric.key] ? (
                <span className="hidden md:inline text-xs text-gray-400 w-16 text-right">
                  ↑ {rateLabels[metric.key]}
                </span>
              ) : (
                <span className="hidden md:inline w-16" />
              )}
            </div>
          );
        })}
      </div>
      </div>{/* end p-6 */}
    </div>
  );
}

export default function SummarySection({ data, selectedPeriod }: Props) {
  const { t, periodLabel } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t.summary.pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.summary.pageDesc(periodLabel(selectedPeriod))}
        </p>
      </div>
      <SummaryCards data={data} selectedPeriod={selectedPeriod} />
      <FunnelViz data={data} selectedPeriod={selectedPeriod} />
    </div>
  );
}
