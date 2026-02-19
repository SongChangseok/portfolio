'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent, getGainLossColor } from '@/lib/utils/formatters';
import type { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        {/* 재무 지표 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">총 평가금액</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">총 손익</p>
            <p className={`text-2xl font-bold ${getGainLossColor(stats.totalGainLoss)}`}>
              {formatCurrency(stats.totalGainLoss)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">총 수익률</p>
            <p className={`text-2xl font-bold ${getGainLossColor(stats.totalReturnRate)}`}>
              {formatPercent(stats.totalReturnRate)}
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-4 border-t" />

        {/* 카운트 지표 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">계좌 수</p>
            <p className="text-lg font-semibold">{stats.accountsCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">보유 종목 수</p>
            <p className="text-lg font-semibold">{stats.stocksCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">보유 건수</p>
            <p className="text-lg font-semibold">{stats.holdingsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
