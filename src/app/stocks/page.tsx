import type { Metadata } from 'next';
import { StocksPageClient } from '@/components/stocks/stocks-page-client';

export const metadata: Metadata = {
  title: '주식 관리',
  description: '보유 주식 종목을 검색하고 관리하세요. 종목별 수익률과 보유 현황을 확인합니다.',
};

export default function StocksPage() {
  return <StocksPageClient />;
}
