import { useState, useEffect, useRef, Fragment } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { InputData, Period, PERIODS, FUNNEL_METRICS } from '../types';
import {
  calcDailyMetrics,
  calcConversionRates,
  CONVERSION_RATE_INFO,
  formatNumber,
  formatRate,
} from '../calculations';
import { useLanguage } from '../i18n';

type TableTab = 'total' | 'daily' | 'conversion';

interface Props {
  data: InputData;
  selectedPeriod: Period;
  pdfMode?: boolean;
}

interface TableRow {
  key: string;
  label: string;
  color: string;
  values: string[];
  rawValues: (number | null)[];
}

function buildRows(
  data: InputData,
  tab: TableTab,
  metricInfoList: ReturnType<typeof useLanguage>['metricInfo'],
  conversionRateInfoList: ReturnType<typeof useLanguage>['conversionRateInfo'],
): TableRow[] {
  if (tab === 'conversion') {
    return conversionRateInfoList.map((info) => {
      const raws = PERIODS.map((p) => calcConversionRates(data[p])[info.key]);
      return {
        key: info.key,
        label: info.label,
        color: info.color,
        values: raws.map((v) => formatRate(v)),
        rawValues: raws,
      };
    });
  }

  return metricInfoList.map((metric) => {
    const raws = PERIODS.map((p) =>
      tab === 'total' ? data[p][metric.key] : calcDailyMetrics(data[p], p)[metric.key],
    );
    return {
      key: metric.key,
      label: tab === 'total' ? metric.label : metric.dailyLabel,
      color: metric.color,
      values: raws.map((v) => formatNumber(v)),
      rawValues: raws,
    };
  });
}

// ── Chart tooltips ──
const CustomTooltipDaily = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-800">{formatNumber(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipRate = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-gray-800">{formatRate(entry.value / 100)}</span>
        </div>
      ))}
    </div>
  );
};

// ── Series dropdown ──
function SeriesDropdown({
  items,
  visible,
  onToggle,
  label,
}: {
  items: { key: string; label: string; color: string }[];
  visible: Set<string>;
  onToggle: (key: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }} className="flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-all"
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
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

      {open && (
        <div
          style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 10 }}
          className="bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]"
        >
          {items.map((item) => {
            const active = visible.has(item.key);
            return (
              <button
                key={item.key}
                onClick={() => onToggle(item.key)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-gray-50 text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? item.color : '#D1D5DB' }}
                />
                <span className={active ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TablesSection({ data, pdfMode }: Props) {
  const { t, metricInfo, conversionRateInfo, periodLabel } = useLanguage();
  const [tab, setTab] = useState<TableTab>('total');

  // ── Per-tab row order (keys only) ──
  const [rowOrders, setRowOrders] = useState<Record<TableTab, string[]>>(() => ({
    total: metricInfo.map((m) => m.key),
    daily: metricInfo.map((m) => m.key),
    conversion: CONVERSION_RATE_INFO.map((i) => i.key),
  }));

  // ── Accordion expanded row keys ──
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // ── DnD transient state ──
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // ── Chart series visibility ──
  const funnelMetricInfo = FUNNEL_METRICS.map((key) => metricInfo.find((m) => m.key === key)!);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    () => new Set(funnelMetricInfo.map((m) => m.key)),
  );
  const [visibleRates, setVisibleRates] = useState<Set<string>>(
    () => new Set(conversionRateInfo.map((info) => info.key)),
  );

  const toggleMetric = (key: string) =>
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleRate = (key: string) =>
    setVisibleRates((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Reset accordion + drag state on tab switch
  useEffect(() => {
    setExpandedRows(new Set());
    setDragKey(null);
    setDragOverKey(null);
  }, [tab]);

  // ── Helpers ──
  function getRowDescription(key: string, currentTab: TableTab): string {
    if (currentTab === 'conversion') {
      return conversionRateInfo.find((r) => r.key === key)?.description ?? '';
    }
    return metricInfo.find((m) => m.key === key)?.description ?? '';
  }

  function getOrderedRows(rawRows: TableRow[], currentTab: TableTab): TableRow[] {
    return rowOrders[currentTab]
      .map((key) => rawRows.find((r) => r.key === key))
      .filter((r): r is TableRow => r !== undefined);
  }

  // ── DnD handlers ──
  function handleDragStart(key: string) {
    setDragKey(key);
  }
  function handleDragEnter(key: string) {
    if (key !== dragKey) setDragOverKey(key);
  }
  function handleDragEnd() {
    setDragKey(null);
    setDragOverKey(null);
  }
  function handleDrop(targetKey: string) {
    if (!dragKey || dragKey === targetKey) {
      handleDragEnd();
      return;
    }
    setRowOrders((prev) => {
      const order = [...prev[tab]];
      const from = order.indexOf(dragKey);
      const to = order.indexOf(targetKey);
      if (from === -1 || to === -1) return prev;
      order.splice(from, 1);
      order.splice(to, 0, dragKey);
      return { ...prev, [tab]: order };
    });
    handleDragEnd();
  }
  function toggleExpanded(key: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // ── Derive ordered rows ──
  const rawRows = buildRows(data, tab, metricInfo, conversionRateInfo);
  const rows = getOrderedRows(rawRows, tab);
  const currentTabInfo = t.tables.tabs.find((tb) => tb.key === tab)!;

  // ── Chart data ──
  const dailyChartData = PERIODS.map((period) => {
    const daily = calcDailyMetrics(data[period], period);
    const entry: Record<string, string | number | null> = { period: periodLabel(period) };
    for (const m of funnelMetricInfo) {
      entry[m.label] = daily[m.key];
    }
    return entry;
  });

  const rateChartData = PERIODS.map((period) => {
    const rates = calcConversionRates(data[period]);
    const entry: Record<string, string | number | null> = { period: periodLabel(period) };
    for (const info of conversionRateInfo) {
      const v = rates[info.key];
      entry[info.label] = v !== null ? parseFloat((v * 100).toFixed(4)) : null;
    }
    return entry;
  });

  const hasDailyData = dailyChartData.some((row) =>
    funnelMetricInfo.some((m) => row[m.label] !== null),
  );
  const hasRateData = rateChartData.some((row) =>
    conversionRateInfo.some((info) => row[info.label] !== null),
  );

  const selectedMetricCount = funnelMetricInfo.filter((m) => visibleMetrics.has(m.key)).length;
  const selectedRateCount = conversionRateInfo.filter((i) => visibleRates.has(i.key)).length;

  // ── PDF mode: render all 3 tabs stacked (no tab UI, no charts) ──
  if (pdfMode) {
    const pdfTabs: TableTab[] = ['total', 'daily', 'conversion'];
    return (
      <div className="space-y-4">
        <div className="bg-[#0A66C2] px-6 py-4 rounded-2xl">
          <h2 className="text-base font-bold text-white">{t.tables.pageTitle}</h2>
          <p className="text-blue-100 text-sm mt-0.5">{t.tables.pageDesc}</p>
        </div>
        {pdfTabs.map((pdfTab) => {
          const tabInfo = t.tables.tabs.find((tb) => tb.key === pdfTab)!;
          const pdfRows = getOrderedRows(
            buildRows(data, pdfTab, metricInfo, conversionRateInfo),
            pdfTab,
          );
          return (
            <div key={pdfTab} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#0A66C2] px-5 py-2.5">
                <h3 className="text-sm font-bold text-white">{tabInfo.label}</h3>
                <p className="text-blue-100 text-xs mt-0.5">{tabInfo.desc}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600 min-w-[200px]">
                        {t.tables.metricHeader}
                      </th>
                      {PERIODS.map((p) => (
                        <th key={p} className="px-5 py-3 text-right text-sm font-semibold text-gray-600 min-w-[90px]">
                          {periodLabel(p)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pdfRows.map((row, idx) => {
                      const baseBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20';
                      return (
                        <tr key={row.key} className={`border-b border-gray-50 ${baseBg}`}>
                          <td className="px-6 py-3 border-r border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                              <span className="text-sm text-gray-800 whitespace-nowrap">{row.label}</span>
                            </div>
                          </td>
                          {row.values.map((val, i) => {
                            const raw = row.rawValues[i];
                            const barWidth = pdfTab === 'conversion' && raw !== null ? Math.min(raw * 100, 100) : 0;
                            return (
                              <td key={i} className="px-5 py-3 text-right text-sm tabular-nums font-medium text-gray-700" style={{ position: 'relative', overflow: 'hidden' }}>
                                {barWidth > 0 && (
                                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barWidth}%`, backgroundColor: row.color, opacity: 0.3, pointerEvents: 'none' }} />
                                )}
                                <span style={{ position: 'relative' }}>
                                  {val === '-' ? <span className="text-gray-300">—</span> : val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Blue header */}
        <div className="bg-[#0A66C2] px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-base font-bold text-white">{t.tables.pageTitle}</h2>
          <p className="text-blue-100 text-sm mt-0.5 hidden sm:block">{t.tables.pageDesc}</p>
        </div>
        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 pt-5 pb-0">
          {t.tables.tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === tb.key
                  ? 'bg-[#0A66C2] text-white font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {tb.label}
            </button>
          ))}
          <p className="hidden md:block ml-3 text-xs text-gray-400">{currentTabInfo.desc}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="sticky left-0 z-10 bg-gray-50 text-left px-6 py-3 text-sm font-semibold text-gray-600 min-w-[200px]">
                  {t.tables.metricHeader}
                </th>
                {PERIODS.map((p) => (
                  <th key={p} className="px-5 py-3 text-right text-sm font-semibold text-gray-600 min-w-[90px]">
                    {periodLabel(p)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isExpanded = expandedRows.has(row.key);
                const isDragging = dragKey === row.key;
                const isDragTarget = dragOverKey === row.key && dragKey !== row.key;
                const description = getRowDescription(row.key, tab);
                const baseBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20';
                const stickyBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                return (
                  <Fragment key={row.key}>
                    {/* ── Main data row ── */}
                    <tr
                      draggable
                      onDragStart={() => handleDragStart(row.key)}
                      onDragEnter={() => handleDragEnter(row.key)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleDrop(row.key); }}
                      onDragEnd={handleDragEnd}
                      className={[
                        'border-b border-gray-50 transition-colors',
                        baseBg,
                        isDragging ? 'opacity-40' : 'hover:bg-gray-50/60',
                        isDragTarget ? 'border-t-2 border-t-[#0A66C2]' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {/* Label cell */}
                      <td className={`sticky left-0 z-10 px-6 py-3.5 border-r border-gray-100 ${stickyBg}`}>
                        <div className="flex items-center gap-2">
                          {/* Drag handle */}
                          <span
                            className="flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-400 select-none"
                            title={t.tables.dragReorder}
                            aria-hidden="true"
                          >
                            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                              <circle cx="2" cy="2"  r="1.5" /><circle cx="8" cy="2"  r="1.5" />
                              <circle cx="2" cy="7"  r="1.5" /><circle cx="8" cy="7"  r="1.5" />
                              <circle cx="2" cy="12" r="1.5" /><circle cx="8" cy="12" r="1.5" />
                            </svg>
                          </span>
                          {/* Color dot */}
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: row.color }}
                          />
                          {/* Label */}
                          <span className="text-sm text-gray-800 whitespace-nowrap">{row.label}</span>
                          {/* Expand/collapse button */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleExpanded(row.key); }}
                            className="ml-auto flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold text-gray-400 hover:text-[#0A66C2] hover:bg-[#E8F1FB] transition-colors select-none"
                            aria-label={isExpanded ? t.tables.expandAriaCollapse : t.tables.expandAriaExpand}
                            aria-expanded={isExpanded}
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        </div>
                      </td>

                      {/* Value cells */}
                      {row.values.map((val, i) => {
                        const raw = row.rawValues[i];
                        const barWidth =
                          tab === 'conversion' && raw !== null
                            ? Math.min(raw * 100, 100)
                            : 0;
                        return (
                          <td
                            key={i}
                            className="px-5 py-3.5 text-right text-sm tabular-nums font-medium text-gray-700"
                            style={{ position: 'relative', overflow: 'hidden' }}
                          >
                            {barWidth > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${barWidth}%`,
                                  backgroundColor: row.color,
                                  opacity: 0.3,
                                  pointerEvents: 'none',
                                }}
                              />
                            )}
                            <span style={{ position: 'relative' }}>
                              {val === '-' ? (
                                <span className="text-gray-300">—</span>
                              ) : (
                                val
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* ── Accordion description row ── */}
                    {isExpanded && description && (
                      <tr className={baseBg}>
                        <td colSpan={6} className="px-6 pb-3.5 pt-0">
                          <div className="ml-12 flex items-start gap-2 rounded-lg bg-[#E8F1FB] px-3 py-2.5">
                            <span
                              className="flex-shrink-0 w-0.5 self-stretch rounded-full"
                              style={{ backgroundColor: row.color }}
                            />
                            <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bar chart: shown under '1일 지표' tab ── */}
      {tab === 'daily' && hasDailyData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-800">{t.charts.dailyTitle}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{t.charts.dailyDesc}</p>
            </div>
            <SeriesDropdown
              items={funnelMetricInfo.map((m) => ({ key: m.key, label: m.label, color: m.color }))}
              visible={visibleMetrics}
              onToggle={toggleMetric}
              label={t.charts.seriesSelect(selectedMetricCount, funnelMetricInfo.length)}
            />
          </div>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <Tooltip content={<CustomTooltipDaily />} />
                {funnelMetricInfo
                  .filter((m) => visibleMetrics.has(m.key))
                  .map((m) => (
                    <Bar
                      key={m.key}
                      dataKey={m.label}
                      fill={m.color}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Line chart: shown under '전환율' tab ── */}
      {tab === 'conversion' && hasRateData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-800">{t.charts.ratesTitle}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{t.charts.ratesDesc}</p>
            </div>
            <SeriesDropdown
              items={conversionRateInfo.map((info) => ({
                key: info.key,
                label: info.label,
                color: info.color,
              }))}
              visible={visibleRates}
              onToggle={toggleRate}
              label={t.charts.seriesSelect(selectedRateCount, conversionRateInfo.length)}
            />
          </div>
          <div className="mt-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rateChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltipRate />} />
                {conversionRateInfo.filter((info) => visibleRates.has(info.key)).map((info) => (
                  <Line
                    key={info.key}
                    type="monotone"
                    dataKey={info.label}
                    stroke={info.color}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
