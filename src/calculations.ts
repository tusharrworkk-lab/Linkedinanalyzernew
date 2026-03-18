import { InputData, MetricData, PERIOD_DAYS, Period, PERIODS } from './types';

export const safeDiv = (a: number | null, b: number | null): number | null => {
  if (a === null || b === null || b === 0) return null;
  return a / b;
};

export const calcDailyMetrics = (data: MetricData, period: Period): MetricData => {
  const days = PERIOD_DAYS[period];
  return {
    impressions: data.impressions !== null ? Math.round(data.impressions / days) : null,
    topPostImpressions: data.topPostImpressions, // not divided — shows the single best post
    memberReach: data.memberReach !== null ? Math.round(data.memberReach / days) : null,
    engagement: data.engagement !== null ? Math.round(data.engagement / days) : null,
    profileViews: data.profileViews !== null ? Math.round(data.profileViews / days) : null,
    followerGrowth: data.followerGrowth !== null ? Math.round(data.followerGrowth / days) : null,
  };
};

export interface ConversionRates {
  memberReachRate: number | null;       // 회원 도달 / 총 노출 수
  profileViewRate: number | null;        // 프로필 조회수 / 회원 도달
  followerConversionRate: number | null; // 팔로워 증가 / 프로필 조회수
  followerImpressionRate: number | null; // 팔로워 증가 / 총 노출 수
  engagementRate: number | null;         // 참여도 / 회원 도달
  engagementFollowerRate: number | null; // 참여도 / 팔로워 증가
}

export interface ConversionRateInfo {
  key: keyof ConversionRates;
  label: string;
  description: string;
  color: string;
}

export const CONVERSION_RATE_INFO: ConversionRateInfo[] = [
  {
    key: 'memberReachRate',
    label: '회원 도달 / 총 노출 수',
    description: '컨텐츠가 새로운 유저에게 얼마나 반복 노출됐는지를 나타낸 비율',
    color: '#0A66C2',
  },
  {
    key: 'profileViewRate',
    label: '프로필 조회수 / 회원 도달',
    description: '피드 소비 단계에서 프로필 탐색 단계로 넘어간 관심 심화 비율',
    color: '#10B981',
  },
  {
    key: 'followerConversionRate',
    label: '팔로워 증가 / 프로필 조회수',
    description: '팔로우할 만큼 신뢰/적합성을 느꼈는지를 나타내는 설득력 지표',
    color: '#8B5CF6',
  },
  {
    key: 'followerImpressionRate',
    label: '팔로워 증가 / 총 노출 수',
    description: '컨텐츠의 노출이 장기적인 관계로 전환된 비율',
    color: '#F59E0B',
  },
  {
    key: 'engagementRate',
    label: '참여도 / 회원 도달',
    description: '유저들의 콘텐츠 공감도 / 반응 유도력 지표',
    color: '#EF4444',
  },
  {
    key: 'engagementFollowerRate',
    label: '참여도 / 팔로워 증가',
    description: '팔로워 증가 대비 반응도 측정 지표',
    color: '#06B6D4',
  },
];

export const calcConversionRates = (data: MetricData): ConversionRates => ({
  memberReachRate: safeDiv(data.memberReach, data.impressions),
  profileViewRate: safeDiv(data.profileViews, data.memberReach),
  followerConversionRate: safeDiv(data.followerGrowth, data.profileViews),
  followerImpressionRate: safeDiv(data.followerGrowth, data.impressions),
  engagementRate: safeDiv(data.engagement, data.memberReach),
  engagementFollowerRate: safeDiv(data.engagement, data.followerGrowth),
});

export const hasAnyData = (inputData: InputData): boolean =>
  PERIODS.some((p) => Object.values(inputData[p]).some((v) => v !== null));

export const formatNumber = (n: number | null): string => {
  if (n === null) return '-';
  return n.toLocaleString('ko-KR');
};

export const formatRate = (n: number | null, digits = 2): string => {
  if (n === null) return '-';
  return `${(n * 100).toFixed(digits)}%`;
};
