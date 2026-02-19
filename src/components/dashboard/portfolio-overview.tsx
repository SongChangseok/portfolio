'use client';

import React, { Suspense } from 'react';
import { ChartSkeleton } from '@/components/common/skeletons';
import type { Account, Holding, Tag, StockTag } from '@/lib/types';

const PortfolioPieChart = React.lazy(() =>
  import('@/components/charts/portfolio-pie-chart').then((m) => ({
    default: m.PortfolioPieChart,
  }))
);

const TagBreakdownChart = React.lazy(() =>
  import('@/components/charts/tag-breakdown-chart').then((m) => ({
    default: m.TagBreakdownChart,
  }))
);

interface PortfolioOverviewProps {
  accounts: Account[];
  holdings: Holding[];
  tags: Tag[];
  stockTags: StockTag[];
}

export function PortfolioOverview({
  accounts,
  holdings,
  tags,
  stockTags,
}: PortfolioOverviewProps) {
  const hasTags = tags.length > 0;

  return (
    <div className="space-y-4">
      {/* 차트 */}
      <div className={`grid gap-4 ${hasTags ? 'lg:grid-cols-2' : ''}`}>
        <Suspense fallback={<ChartSkeleton />}>
          <PortfolioPieChart accounts={accounts} holdings={holdings} />
        </Suspense>
        {hasTags && (
          <Suspense fallback={<ChartSkeleton />}>
            <TagBreakdownChart holdings={holdings} stockTags={stockTags} tags={tags} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
