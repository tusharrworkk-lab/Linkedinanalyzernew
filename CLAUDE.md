# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build (outputs to dist/)
npx tsc --noEmit # Type-check without emitting files
```

## Stack

- **Vite** + **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** v3 — utility-first styling
- **Recharts** — charts (BarChart, LineChart)
- No backend — all logic is pure client-side calculation

## Architecture

```
src/
├── types.ts          # All shared types + constants (PERIODS, METRIC_INFO, EXAMPLE_DATA)
├── calculations.ts   # Pure calculation functions (calcDailyMetrics, calcConversionRates, formatters)
├── App.tsx           # Root: state (inputData, activeSection, selectedPeriod) + sidebar layout
└── components/
    ├── Sidebar.tsx         # Fixed left nav: period selector + section navigation
    ├── InputSection.tsx    # YouTube video guide placeholders + InputForm
    ├── InputForm.tsx       # 6×5 input table (6 metrics × 5 periods)
    ├── SummarySection.tsx  # Summary cards + funnel visualization
    ├── TablesSection.tsx   # 3-tab tables: 총 지표 / 1일 지표 / 전환율
    ├── ChartsSection.tsx   # Wrapper for Charts
    ├── Charts.tsx          # Bar chart (daily avg) + Line chart (conversion rates)
    └── GuideSection.tsx    # Metric guide, action items, hypothesis text areas
```

### Key data flow

- `App.tsx` owns all state: `inputData` (InputData type), `activeSection`, `selectedPeriod`
- `selectedPeriod` is passed down to sections that need period-specific views (Summary, Tables, Charts)
- `inputData` is a `Record<Period, MetricData>` — a 5×6 grid of nullable numbers
- All derived values (daily metrics, conversion rates) are computed on-the-fly in `calculations.ts` — no derived state stored

### Domain logic (`calculations.ts`)

- **Daily metrics** = total metric ÷ period days (except `topPostImpressions` which stays as-is)
- **6 conversion rates**: memberReachRate, profileViewRate, followerConversionRate, followerImpressionRate, engagementRate, engagementFollowerRate
- Periods: 7일(7d), 14일(14d), 28일(28d), 90일(90d), 365일(365d)
- Metrics: impressions, topPostImpressions, memberReach, engagement, profileViews, followerGrowth

### Adding YouTube video URLs

In `src/components/InputSection.tsx`, find the `VIDEO_GUIDES` array and replace `href: '#'` with actual YouTube URLs.

## Design conventions

- LinkedIn blue: `#0A66C2` / light blue bg: `#E8F1FB`
- Card style: `bg-white rounded-2xl shadow-sm border border-gray-100`
- Active nav: `bg-[#E8F1FB] text-[#0A66C2]`
- All metric colors defined in `METRIC_INFO` in `types.ts`
