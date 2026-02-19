'use client';

import { TopHoldingsBarChart } from '@/components/charts/top-holdings-bar-chart';
import type { Holding, Stock } from '@/lib/types';

interface TopHoldingsProps {
  holdings: Holding[];
  stocks: Stock[];
}

export function TopHoldings({ holdings, stocks }: TopHoldingsProps) {
  return <TopHoldingsBarChart holdings={holdings} stocks={stocks} />;
}
