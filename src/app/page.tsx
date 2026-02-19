'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/common/loading';
import { EmptyState } from '@/components/common/empty-state';
import { PortfolioPieChart } from '@/components/charts/portfolio-pie-chart';
import { TagBreakdownChart } from '@/components/charts/tag-breakdown-chart';
import { TopHoldingsBarChart } from '@/components/charts/top-holdings-bar-chart';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useHoldings } from '@/lib/hooks/use-holdings';
import { useStocks } from '@/lib/hooks/use-stocks';
import { useTags } from '@/lib/hooks/use-tags';
import { usePortfolioStats, useAllStockTags } from '@/lib/hooks/use-portfolio-stats';
import {
  formatCurrency,
  formatPercent,
  getGainLossColor,
} from '@/lib/utils/formatters';
import { BarChart3, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();
  const { data: stocks, isLoading: stocksLoading } = useStocks();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: stockTags, isLoading: stockTagsLoading } = useAllStockTags();
  const { data: stats, isLoading: statsLoading } = usePortfolioStats();

  const isLoading =
    accountsLoading || holdingsLoading || stocksLoading || tagsLoading || stockTagsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            포트폴리오 현황을 한눈에 확인하세요
          </p>
        </div>
        <Loading message="데이터를 불러오는 중..." />
      </div>
    );
  }

  const hasData = holdings && holdings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          포트폴리오 현황을 한눈에 확인하세요
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="포트폴리오가 비어있습니다"
          description="계좌를 만들고 보유 종목을 추가하면 대시보드에서 현황을 확인할 수 있습니다."
          action={
            <Button asChild>
              <Link href="/accounts">계좌 관리로 이동</Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    총 평가금액
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    총 매입금액
                  </CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(stats.totalCost)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    총 손익
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${getGainLossColor(stats.totalGainLoss)}`}
                  >
                    {formatCurrency(stats.totalGainLoss)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    총 수익률
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${getGainLossColor(stats.totalReturnRate)}`}
                  >
                    {formatPercent(stats.totalReturnRate)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Row: Portfolio Pie + Tag Breakdown */}
          <div className={`grid gap-4 ${tags && tags.length > 0 ? 'lg:grid-cols-2' : ''}`}>
            <PortfolioPieChart
              accounts={accounts ?? []}
              holdings={holdings ?? []}
            />
            {tags && stockTags && tags.length > 0 && (
              <TagBreakdownChart
                holdings={holdings ?? []}
                stockTags={stockTags}
                tags={tags}
              />
            )}
          </div>

          {/* Top Holdings Bar Chart */}
          <TopHoldingsBarChart
            holdings={holdings ?? []}
            stocks={stocks ?? []}
          />
        </>
      )}
    </div>
  );
}
