import { format } from 'date-fns';

// 통화 포맷팅 (₩1,234,567)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

// 퍼센트 포맷팅 (+12.34%)
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// 숫자 포맷팅 (1,234)
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

// 날짜 포맷팅 (2026-02-08 14:30)
export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd HH:mm');
}

// 손익 색상 클래스
export function getGainLossColor(value: number): string {
  if (value > 0) return 'text-red-500';
  if (value < 0) return 'text-blue-500';
  return 'text-muted-foreground';
}
