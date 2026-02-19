'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioPieChart } from '@/components/charts/portfolio-pie-chart';
import { TagBreakdownChart } from '@/components/charts/tag-breakdown-chart';
import type { Account, Holding, Tag, StockTag, DashboardStats } from '@/lib/types';

interface PortfolioOverviewProps {
  accounts: Account[];
  holdings: Holding[];
  tags: Tag[];
  stockTags: StockTag[];
  stats: DashboardStats;
}

export function PortfolioOverview({
  accounts,
  holdings,
  tags,
  stockTags,
  stats,
}: PortfolioOverviewProps) {
  const hasTags = tags.length > 0;

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">계좌 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.accountsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">보유 종목 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.stocksCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">보유 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{stats.holdingsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 */}
      <div className={`grid gap-4 ${hasTags ? 'lg:grid-cols-2' : ''}`}>
        <PortfolioPieChart accounts={accounts} holdings={holdings} />
        {hasTags && (
          <TagBreakdownChart holdings={holdings} stockTags={stockTags} tags={tags} />
        )}
      </div>
    </div>
  );
}
