'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatDate, getGainLossColor } from '@/lib/utils/formatters';
import type { HoldingWithDetails } from '@/lib/types';

interface RecentUpdatesProps {
  holdingsWithDetails: HoldingWithDetails[];
  limit?: number;
}

export function RecentUpdates({ holdingsWithDetails, limit = 10 }: RecentUpdatesProps) {
  const sorted = [...holdingsWithDetails]
    .sort((a, b) => b.lastPriceUpdate - a.lastPriceUpdate)
    .slice(0, limit);

  if (sorted.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 업데이트</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-3 text-left font-medium">종목명</th>
                <th className="p-3 text-right font-medium">현재가</th>
                <th className="p-3 text-right font-medium">손익</th>
                <th className="p-3 text-right font-medium">수익률</th>
                <th className="p-3 text-right font-medium">업데이트 시각</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((h) => (
                <tr key={h.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-3 font-medium">{h.stock.name}</td>
                  <td className="p-3 text-right">{formatCurrency(h.currentPrice)}</td>
                  <td className={`p-3 text-right ${getGainLossColor(h.gainLoss)}`}>
                    {formatCurrency(h.gainLoss)}
                  </td>
                  <td className={`p-3 text-right ${getGainLossColor(h.returnRate)}`}>
                    {formatPercent(h.returnRate)}
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {formatDate(h.lastPriceUpdate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
