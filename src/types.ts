export const PERIODS = ['7일', '14일', '28일', '90일', '365일'] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_DAYS: Record<Period, number> = {
  '7일': 7,
  '14일': 14,
  '28일': 28,
  '90일': 90,
  '365일': 365,
};

export const METRIC_KEYS = [
  'impressions',
  'topPostImpressions',
  'memberReach',
  'engagement',
  'profileViews',
  'followerGrowth',
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export interface MetricInfo {
  key: MetricKey;
  label: string;
  dailyLabel: string;
  description: string;
  color: string;
  funnelStep: number;
}

export const METRIC_INFO: MetricInfo[] = [
  {
    key: 'impressions',
    label: '총 노출 수',
    dailyLabel: '(1일 기준) 평균 노출 수',
    description: '업데이트가 LinkedIn에서 노출된 횟수',
    color: '#0A66C2',
    funnelStep: 1,
  },
  {
    key: 'topPostImpressions',
    label: '최고 포스트 노출 수',
    dailyLabel: '(1일 기준) 최고 포스트 노출 수',
    description: '가장 노출이 높은 포스트가 노출된 횟수',
    color: '#2D8BE0',
    funnelStep: 0,
  },
  {
    key: 'memberReach',
    label: '회원 도달',
    dailyLabel: '(1일 기준) 회원 도달',
    description: 'LinkedIn에서 업데이트를 조회한 계정의 수',
    color: '#5CB8E4',
    funnelStep: 2,
  },
  {
    key: 'engagement',
    label: '참여도',
    dailyLabel: '(1일 기준) 참여도',
    description: '사람들이 업데이트와 상호작용한 횟수',
    color: '#F59E0B',
    funnelStep: 3,
  },
  {
    key: 'profileViews',
    label: '프로필 조회수',
    dailyLabel: '(1일 기준) 프로필 조회수',
    description: '사람들이 직접 프로필을 조회한 횟수',
    color: '#10B981',
    funnelStep: 4,
  },
  {
    key: 'followerGrowth',
    label: '팔로워 증가',
    dailyLabel: '(1일 기준) 팔로워 증가',
    description: '사람들이 해당 계정을 팔로잉한 증가 수',
    color: '#8B5CF6',
    funnelStep: 5,
  },
];

// Metrics that appear in the funnel (in order)
export const FUNNEL_METRICS: MetricKey[] = [
  'impressions',
  'memberReach',
  'engagement',
  'profileViews',
  'followerGrowth',
];

export type MetricData = Record<MetricKey, number | null>;
export type InputData = Record<Period, MetricData>;

export type WizardAnswers = {
  goal: string;
  followerRange: string;
  followerCount: string;
  frequency: string;
  industry: string;
};

export const EMPTY_METRIC: MetricData = {
  impressions: null,
  topPostImpressions: null,
  memberReach: null,
  engagement: null,
  profileViews: null,
  followerGrowth: null,
};

export const EXAMPLE_DATA: InputData = {
  '7일': {
    impressions: 10744,
    topPostImpressions: 4180,
    memberReach: 4737,
    engagement: 97,
    profileViews: null,
    followerGrowth: 154,
  },
  '14일': {
    impressions: 21239,
    topPostImpressions: 10729,
    memberReach: 8419,
    engagement: 207,
    profileViews: 340,
    followerGrowth: 277,
  },
  '28일': {
    impressions: 38284,
    topPostImpressions: 10729,
    memberReach: 10953,
    engagement: 371,
    profileViews: 648,
    followerGrowth: 564,
  },
  '90일': {
    impressions: 207376,
    topPostImpressions: 80375,
    memberReach: 63658,
    engagement: 1488,
    profileViews: 1976,
    followerGrowth: 1811,
  },
  '365일': {
    impressions: 1857207,
    topPostImpressions: 80375,
    memberReach: 172860,
    engagement: 22879,
    profileViews: 11634,
    followerGrowth: 6913,
  },
};
