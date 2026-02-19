'use client';

import React, { Suspense } from 'react';
import { ChartSkeleton } from '@/components/common/skeletons';
import type { Holding, Stock } from '@/lib/types';

const TopHoldingsBarChart = React.lazy(() =>
  import('@/components/charts/top-holdings-bar-chart').then((m) => ({
    default: m.TopHoldingsBarChart,
  }))
);

interface TopHoldingsProps {
  holdings: Holding[];
  stocks: Stock[];
}

export function TopHoldings({ holdings, stocks }: TopHoldingsProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <TopHoldingsBarChart holdings={holdings} stocks={stocks} />
    </Suspense>
  );
}
