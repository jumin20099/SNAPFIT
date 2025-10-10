export const REPORT_CATEGORIES = [
  {
    value: 'SPAM' as const,
    label: '스팸/홍보',
    description: '반복적인 광고, 홍보, 도배 행위'
  },
  {
    value: 'INAPPROPRIATE_CONTENT' as const,
    label: '부적절한 콘텐츠',
    description: '음란물, 폭력성 등 부적절한 내용'
  },
  {
    value: 'HARASSMENT' as const,
    label: '욕설/혐오/괴롭힘',
    description: '욕설, 인신공격, 차별적 표현'
  },
  {
    value: 'OTHER' as const,
    label: '기타',
    description: '기타 신고 사유 (직접 입력)'
  }
];

export const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: '대기',
  PROCESSING: '처리중',
  RESOLVED: '완료',
  REJECTED: '거부'
};

export type ReportCategoryValue = typeof REPORT_CATEGORIES[number]['value'];
