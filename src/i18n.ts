import { createContext, useContext, useState, ReactNode, createElement } from 'react';
import { Period, MetricInfo, METRIC_INFO } from './types';
import { ConversionRateInfo, CONVERSION_RATE_INFO } from './calculations';

export type Language = 'ko' | 'en';

const PERIOD_LABELS: Record<Language, Record<Period, string>> = {
  ko: { '7일': '7일', '14일': '14일', '28일': '28일', '90일': '90일', '365일': '365일' },
  en: { '7일': '7 days', '14일': '14 days', '28일': '28 days', '90일': '90 days', '365일': '365 days' },
};

const METRIC_INFO_EN: MetricInfo[] = [
  {
    key: 'impressions',
    label: 'Total Impressions',
    dailyLabel: '(Daily) Avg Impressions',
    description: 'Number of times your updates were shown on LinkedIn',
    color: '#0A66C2',
    funnelStep: 1,
  },
  {
    key: 'topPostImpressions',
    label: 'Top Post Impressions',
    dailyLabel: '(Daily) Top Post Impressions',
    description: 'Number of times your highest-performing post was shown',
    color: '#2D8BE0',
    funnelStep: 0,
  },
  {
    key: 'memberReach',
    label: 'Member Reach',
    dailyLabel: '(Daily) Member Reach',
    description: 'Number of unique accounts that viewed your updates on LinkedIn',
    color: '#5CB8E4',
    funnelStep: 2,
  },
  {
    key: 'engagement',
    label: 'Engagement',
    dailyLabel: '(Daily) Engagement',
    description: 'Number of times people interacted with your updates',
    color: '#F59E0B',
    funnelStep: 3,
  },
  {
    key: 'profileViews',
    label: 'Profile Views',
    dailyLabel: '(Daily) Profile Views',
    description: 'Number of times people directly visited your profile',
    color: '#10B981',
    funnelStep: 4,
  },
  {
    key: 'followerGrowth',
    label: 'Follower Growth',
    dailyLabel: '(Daily) Follower Growth',
    description: 'Number of new followers gained during the period',
    color: '#8B5CF6',
    funnelStep: 5,
  },
];

const CONVERSION_RATE_INFO_EN: ConversionRateInfo[] = [
  {
    key: 'memberReachRate',
    label: 'Member Reach / Impressions',
    description: 'Rate indicating how often content reached unique users vs. total exposures',
    color: '#0A66C2',
  },
  {
    key: 'profileViewRate',
    label: 'Profile Views / Member Reach',
    description: 'Rate of audience moving from feed consumption to profile exploration',
    color: '#10B981',
  },
  {
    key: 'followerConversionRate',
    label: 'Follower Growth / Profile Views',
    description: 'Persuasion metric: rate of profile visitors who chose to follow',
    color: '#8B5CF6',
  },
  {
    key: 'followerImpressionRate',
    label: 'Follower Growth / Impressions',
    description: 'Rate at which content impressions convert to long-term followers',
    color: '#F59E0B',
  },
  {
    key: 'engagementRate',
    label: 'Engagement / Member Reach',
    description: 'Content resonance and reaction-driving metric among reached members',
    color: '#EF4444',
  },
  {
    key: 'engagementFollowerRate',
    label: 'Engagement / Follower Growth',
    description: 'Engagement relative to follower growth — reactivity measurement',
    color: '#06B6D4',
  },
];

const translations = {
  ko: {
    app: {
      title: 'LinkedIn 분석기',
      menuOpen: '메뉴 열기',
      pdfGenerating: 'PDF 생성 중...',
      pdfWait: '잠시만 기다려주세요',
      pdfDateLabel: '생성일',
    },
    sidebar: {
      analyzer: '분석기',
      period: '분석 기간',
      menu: '메뉴',
      pdfSave: (period: string) => `📄 PDF 저장 (${period})`,
      pdfSaving: '저장 중...',
      dragReorder: '드래그하여 순서 변경',
      nav: {
        input: '데이터 입력',
        summary: '분석 요약',
        tables: '지표 테이블',
        charts: '차트 분석',
        guide: '지표 가이드',
      },
    },
    input: {
      pageTitle: '데이터 입력',
      pageDesc: 'LinkedIn Analytics에서 각 기간별 지표를 확인하고 아래 표에 입력하세요',
      videoGuideTitle: 'LinkedIn 데이터 추출 가이드',
      videoGuideDesc: '아래 영상을 참고해 LinkedIn에서 각 지표 데이터를 추출해보세요',
      comingSoon: '준비 중',
      watchYoutube: 'YouTube에서 보기 →',
      videos: [
        { title: 'LinkedIn Analytics 접속 방법', description: 'LinkedIn 분석 탭을 찾고 데이터 추출 화면에 접근하는 방법' },
        { title: '노출 수 & 회원 도달 데이터 찾기', description: '총 노출 수, 최고 포스트 노출, 회원 도달 수치 확인 방법' },
        { title: '참여도 & 프로필 조회수 확인', description: '참여도(좋아요·댓글·공유) 및 프로필 조회수 데이터 위치' },
        { title: '팔로워 증가 데이터 확인', description: '기간별 팔로워 증가 수 확인 및 날짜 필터 사용 방법' },
      ],
      prevSlide: '이전 슬라이드',
      nextSlide: '다음 슬라이드',
      slideN: (n: number) => `슬라이드 ${n}`,
      formTitle: '📊 데이터 입력',
      formDesc: 'LinkedIn Analytics에서 각 기간별 지표를 입력하세요',
      loadExample: '예시 데이터',
      reset: '초기화',
      metricHeader: '지표',
      videoGuideButton: '🎬 데이터 추출 가이드 보기',
      tip: '💡 LinkedIn Analytics → 분석 탭에서 각 기간별 수치를 확인할 수 있습니다. 프로필 조회수는 프로필 조회자 섹션에서 확인하세요.',
    },
    summary: {
      pageTitle: '분석 요약',
      pageDesc: (period: string) =>
        `선택한 기간(${period})의 핵심 지표와 전환 퍼널을 확인하세요. 사이드바에서 기간을 변경할 수 있습니다.`,
      dailyAvg: (val: string) => `1일 평균 ${val}`,
      periodBadge: (days: number) => `${days}일`,
      funnelTitle: '전환 퍼널',
      funnelDesc: (period: string) => `${period} 기준 노출부터 팔로워까지의 전환 흐름`,
    },
    tables: {
      pageTitle: '지표 테이블',
      pageDesc: '모든 기간(7일 ~ 365일)의 지표를 한눈에 비교하세요',
      metricHeader: '지표',
      dragReorder: '드래그하여 순서 변경',
      tabs: [
        { key: 'total' as const, label: '총 지표', desc: '각 기간 동안의 누적 수치' },
        { key: 'daily' as const, label: '1일 지표', desc: '기간을 일 수로 나눈 하루 평균' },
        { key: 'conversion' as const, label: '전환율', desc: '단계 간 전환 비율' },
      ],
      expandAriaExpand: '설명 보기',
      expandAriaCollapse: '설명 접기',
    },
    charts: {
      pageTitle: '차트 분석',
      pageDesc: '기간별 지표 변화와 전환율 추이를 시각화합니다',
      seriesSelect: (sel: number, total: number) => `계열 선택 (${sel}/${total})`,
      dailyTitle: '기간별 1일 평균 지표 비교',
      dailyDesc: '각 기간의 하루 평균 수치를 비교합니다',
      ratesTitle: '기간별 전환율 추이',
      ratesDesc: '각 기간별 전환율의 변화를 확인합니다 (%)',
    },
    guide: {
      pageTitle: '지표 가이드',
      pageDesc: '각 지표의 의미와 전환율 해석 방법, 그리고 개선 액션 아이템을 확인하세요',
      metricsTitle: '📊 기본 지표 설명',
      conversionTitle: '🔄 전환율 지표 설명',
      actionTitle: '✅ 액션 아이템',
      hypothesisTitle: '💡 나의 가설',
      hypothesisDesc: '데이터를 분석하면서 세운 가설을 기록해두세요',
      hypothesisPlaceholder: (n: number) => `가설 ${n}을 입력하세요...`,
      actionItems: [
        '콘텐츠 전략 수립',
        '참여도를 위한 상호 작용 넣기 (질문, CTA 포함)',
        '프로필 정기 업데이트',
        '전환율 맞춤형 컨텐츠 제작',
        '장기적인 데이터 모니터링',
      ],
    },
    wizard: {
      step: (cur: number, total: number) => `${cur} / ${total}`,
      next: '다음',
      back: '이전',
      complete: '완료',
      questions: [
        {
          title: '링크드인을 사용하는 주요 목표는 무엇인가요?',
          subtitle: '현재 가장 중요한 목표를 선택해주세요',
          options: ['취업 / 이직', '퍼스널 브랜딩', '리드 확보', '강의 / 제품 판매', '업계 네트워킹'],
        },
        {
          title: '현재 링크드인 팔로워 수 범위는?',
          subtitle: '가장 가까운 범위를 선택해주세요',
          options: ['500명 미만', '500 ~ 1,000명', '1,000 ~ 5,000명', '5,000 ~ 10,000명', '10,000 ~ 20,000명', '20,000명 이상'],
        },
        {
          title: '주간 게시물 빈도는?',
          subtitle: '최근 한 달 기준으로 선택해주세요',
          options: ['주 1회 미만', '주 1회', '주 2~3회', '주 4~5회', '매일 게시'],
        },
        {
          title: '현재 종사하는 업종은?',
          subtitle: '가장 가까운 업종을 선택해주세요',
          options: ['IT / 테크놀로지', '금융 / 보험', '헬스케어', '마케팅 / 광고', '세일즈', '제조업 / 건설업', '교육 / 컨설팅'],
        },
      ],
      followerInput: {
        title: '정확한 팔로워 수를 입력해주세요',
        subtitle: '선택한 범위 내 현재 팔로워 수를 숫자로 입력하세요',
        placeholder: '예: 2,450',
        label: '팔로워 수',
      },
      profileCard: {
        title: '내 LinkedIn 프로필',
        labels: ['목표', '팔로워 수', '게시 빈도', '업종'] as const,
        edit: '수정',
      },
    },
  },
  en: {
    app: {
      title: 'LinkedIn Analyzer',
      menuOpen: 'Open menu',
      pdfGenerating: 'Generating PDF...',
      pdfWait: 'Please wait',
      pdfDateLabel: 'Generated',
    },
    sidebar: {
      analyzer: 'Analyzer',
      period: 'Period',
      menu: 'Menu',
      pdfSave: (period: string) => `📄 Save PDF (${period})`,
      pdfSaving: 'Saving...',
      dragReorder: 'Drag to reorder',
      nav: {
        input: 'Data Input',
        summary: 'Summary',
        tables: 'Metric Tables',
        charts: 'Charts',
        guide: 'Guide',
      },
    },
    input: {
      pageTitle: 'Data Input',
      pageDesc: 'Check your metrics in LinkedIn Analytics and enter them in the table below',
      videoGuideTitle: 'LinkedIn Data Extraction Guide',
      videoGuideDesc: 'Follow these videos to extract each metric from LinkedIn',
      comingSoon: 'Coming Soon',
      watchYoutube: 'Watch on YouTube →',
      videos: [
        { title: 'How to Access LinkedIn Analytics', description: 'How to find the Analytics tab and access the data export screen' },
        { title: 'Finding Impressions & Member Reach', description: 'How to find total impressions, top post impressions, and member reach' },
        { title: 'Checking Engagement & Profile Views', description: 'Where to find engagement (likes, comments, shares) and profile views data' },
        { title: 'Checking Follower Growth Data', description: 'How to check follower growth by period and use date filters' },
      ],
      prevSlide: 'Previous slide',
      nextSlide: 'Next slide',
      slideN: (n: number) => `Slide ${n}`,
      formTitle: '📊 Data Input',
      formDesc: 'Enter your LinkedIn Analytics metrics for each period',
      loadExample: 'Load Example',
      reset: 'Reset',
      metricHeader: 'Metric',
      videoGuideButton: '🎬 View Data Extraction Guide',
      tip: '💡 You can find period-specific metrics in LinkedIn Analytics → Analytics tab. Profile Views are in the Profile Viewers section.',
    },
    summary: {
      pageTitle: 'Summary',
      pageDesc: (period: string) =>
        `View key metrics and the conversion funnel for the selected period (${period}). Change the period in the sidebar.`,
      dailyAvg: (val: string) => `Daily avg ${val}`,
      periodBadge: (days: number) => `${days}d`,
      funnelTitle: 'Conversion Funnel',
      funnelDesc: (period: string) => `${period} — Conversion flow from impressions to followers`,
    },
    tables: {
      pageTitle: 'Metric Tables',
      pageDesc: 'Compare all periods (7 days ~ 365 days) at a glance',
      metricHeader: 'Metric',
      dragReorder: 'Drag to reorder',
      tabs: [
        { key: 'total' as const, label: 'Total', desc: 'Cumulative values for each period' },
        { key: 'daily' as const, label: 'Daily', desc: 'Daily average (total ÷ days)' },
        { key: 'conversion' as const, label: 'Conversion', desc: 'Conversion rates between stages' },
      ],
      expandAriaExpand: 'Show description',
      expandAriaCollapse: 'Hide description',
    },
    charts: {
      pageTitle: 'Charts',
      pageDesc: 'Visualize metric trends and conversion rate changes over periods',
      seriesSelect: (sel: number, total: number) => `Series (${sel}/${total})`,
      dailyTitle: 'Daily Average Metrics by Period',
      dailyDesc: 'Compare daily average values across periods',
      ratesTitle: 'Conversion Rate Trends by Period',
      ratesDesc: 'Track how conversion rates change across periods (%)',
    },
    guide: {
      pageTitle: 'Guide',
      pageDesc: 'Learn the meaning of each metric, how to interpret conversion rates, and actionable improvement items',
      metricsTitle: '📊 Basic Metric Descriptions',
      conversionTitle: '🔄 Conversion Rate Descriptions',
      actionTitle: '✅ Action Items',
      hypothesisTitle: '💡 My Hypotheses',
      hypothesisDesc: 'Record the hypotheses you form while analyzing your data',
      hypothesisPlaceholder: (n: number) => `Enter hypothesis ${n}...`,
      actionItems: [
        'Develop a content strategy',
        'Add interaction elements (questions, CTAs)',
        'Regularly update your profile',
        'Create conversion-optimized content',
        'Monitor data trends long-term',
      ],
    },
    wizard: {
      step: (cur: number, total: number) => `${cur} / ${total}`,
      next: 'Next',
      back: 'Back',
      complete: 'Done',
      questions: [
        {
          title: 'What is your main goal on LinkedIn?',
          subtitle: 'Select your most important goal right now',
          options: ['Job Search / Career', 'Personal Branding', 'Lead Generation', 'Course / Product Sales', 'Industry Networking'],
        },
        {
          title: 'What is your current follower range?',
          subtitle: 'Choose the range closest to your current count',
          options: ['Under 500', '500 – 1,000', '1,000 – 5,000', '5,000 – 10,000', '10,000 – 20,000', '20,000+'],
        },
        {
          title: 'How often do you post per week?',
          subtitle: 'Based on the past month',
          options: ['Less than once a week', 'Once a week', '2–3 times a week', '4–5 times a week', 'Daily'],
        },
        {
          title: 'What industry are you in?',
          subtitle: 'Choose the closest match',
          options: ['IT / Technology', 'Finance / Insurance', 'Healthcare', 'Marketing / Advertising', 'Sales', 'Manufacturing / Construction', 'Education / Consulting'],
        },
      ],
      followerInput: {
        title: 'Enter your exact follower count',
        subtitle: 'Enter the number within the range you selected',
        placeholder: 'e.g. 2,450',
        label: 'Followers',
      },
      profileCard: {
        title: 'My LinkedIn Profile',
        labels: ['Goal', 'Followers', 'Post Frequency', 'Industry'] as const,
        edit: 'Edit',
      },
    },
  },
} as const;

export type Translations = typeof translations['ko'];

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasSelected: boolean;
  selectLanguage: (lang: Language) => void;
  t: Translations;
  metricInfo: MetricInfo[];
  conversionRateInfo: ConversionRateInfo[];
  periodLabel: (p: Period) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [chosenLanguage, setChosenLanguage] = useState<Language | null>(null);

  const language: Language = chosenLanguage ?? 'ko';
  const hasSelected = chosenLanguage !== null;
  const selectLanguage = (lang: Language) => setChosenLanguage(lang);
  const setLanguage = (lang: Language) => setChosenLanguage(lang);

  const t = translations[language] as Translations;
  const metricInfo = language === 'en' ? METRIC_INFO_EN : METRIC_INFO;
  const conversionRateInfo = language === 'en' ? CONVERSION_RATE_INFO_EN : CONVERSION_RATE_INFO;
  const periodLabel = (p: Period) => PERIOD_LABELS[language][p];

  return createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, hasSelected, selectLanguage, t, metricInfo, conversionRateInfo, periodLabel } },
    children,
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function LanguageSelectScreen() {
  const { selectLanguage } = useLanguage();
  return createElement(
    'div',
    { className: 'min-h-screen bg-[#E8F1FB] flex items-center justify-center p-4' },
    createElement(
      'div',
      { className: 'bg-white rounded-2xl shadow-sm border border-gray-100 px-10 py-12 flex flex-col items-center gap-8 max-w-sm w-full' },
      // LinkedIn logo + dual-language title
      createElement(
        'div',
        { className: 'flex flex-col items-center gap-3' },
        createElement(
          'svg',
          { viewBox: '0 0 24 24', className: 'w-12 h-12', fill: '#0A66C2' },
          createElement('path', {
            d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
          }),
        ),
        createElement(
          'div',
          { className: 'text-center' },
          createElement('p', { className: 'text-xl font-bold text-gray-900 leading-tight' }, 'LinkedIn 분석기'),
          createElement('p', { className: 'text-sm text-gray-400 mt-0.5' }, 'LinkedIn Analyzer'),
        ),
      ),
      // Prompt
      createElement(
        'div',
        { className: 'text-center' },
        createElement('p', { className: 'text-base font-semibold text-gray-700' }, '언어를 선택하세요'),
        createElement('p', { className: 'text-sm text-gray-400 mt-1' }, 'Choose your language'),
      ),
      // Buttons
      createElement(
        'div',
        { className: 'flex flex-col gap-3 w-full' },
        createElement(
          'button',
          {
            onClick: () => selectLanguage('ko'),
            className:
              'w-full py-3 rounded-xl bg-[#0A66C2] text-white font-semibold text-base hover:bg-[#095BA0] transition-colors shadow-sm',
          },
          '한국어',
        ),
        createElement(
          'button',
          {
            onClick: () => selectLanguage('en'),
            className:
              'w-full py-3 rounded-xl border-2 border-[#0A66C2] text-[#0A66C2] font-semibold text-base hover:bg-[#E8F1FB] transition-colors',
          },
          'English',
        ),
      ),
    ),
  );
}

export function LanguageTab() {
  const { language, setLanguage } = useLanguage();
  return createElement(
    'div',
    { className: 'flex items-center bg-gray-100 rounded-lg p-0.5' },
    ...(['ko', 'en'] as Language[]).map((lang) =>
      createElement(
        'button',
        {
          key: lang,
          onClick: () => setLanguage(lang),
          className: `px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            language === lang
              ? 'bg-[#0A66C2] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`,
        },
        lang === 'ko' ? '한국어' : 'English',
      ),
    ),
  );
}
