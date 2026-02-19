'use client';

import { useQueryClient } from '@tanstack/react-query';
import { DashboardSkeleton } from '@/components/common/skeletons';
import { EmptyState } from '@/components/common/empty-state';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { PortfolioOverview } from '@/components/dashboard/portfolio-overview';
import { TopHoldings } from '@/components/dashboard/top-holdings';
import { RecentUpdates } from '@/components/dashboard/recent-updates';
import { useAccounts } from '@/lib/hooks/use-accounts';
import { useHoldings } from '@/lib/hooks/use-holdings';
import { useStocks } from '@/lib/hooks/use-stocks';
import { useTags } from '@/lib/hooks/use-tags';
import { usePortfolioStats, useAllStockTags } from '@/lib/hooks/use-portfolio-stats';
import { formatDate } from '@/lib/utils/formatters';
import { BarChart3, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useHoldings();
  const { data: stocks, isLoading: stocksLoading } = useStocks();
  const { data: tags, isLoading: tagsLoading } = useTags();
  const { data: stockTags, isLoading: stockTagsLoading } = useAllStockTags();
  const { data: stats, isLoading: statsLoading } = usePortfolioStats();

  const isLoading =
    accountsLoading || holdingsLoading || stocksLoading || tagsLoading || stockTagsLoading || statsLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] });
    queryClient.invalidateQueries({ queryKey: ['holdings'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    queryClient.invalidateQueries({ queryKey: ['stocks'] });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasData = holdings && holdings.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">포트폴리오 현황을 한눈에 확인하세요</p>
          {stats?.lastPriceUpdateAt && (
            <p className="text-xs text-muted-foreground mt-1">
              마지막 업데이트: {formatDate(stats.lastPriceUpdateAt)}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          새로고침
        </Button>
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
          {stats && <StatsCards stats={stats} />}

          <PortfolioOverview
            accounts={accounts ?? []}
            holdings={holdings ?? []}
            tags={tags ?? []}
            stockTags={stockTags ?? []}
            stats={stats!}
          />

          <TopHoldings holdings={holdings ?? []} stocks={stocks ?? []} />

          {stats && (
            <RecentUpdates holdingsWithDetails={stats.holdingsWithDetails} />
          )}
        </>
      )}
    </div>
  );
}
