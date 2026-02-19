'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from './chart-container';
import { transformTopHoldings } from '@/lib/utils/chart-data';
import { getChartColor } from '@/lib/utils/chart-colors';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import type { Holding, Stock } from '@/lib/types';

interface TopHoldingsBarChartProps {
  holdings: Holding[];
  stocks: Stock[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; gainLoss: number; returnRate: number }; }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        평가금액: {formatCurrency(data.value)}
      </p>
      <p className="text-sm text-muted-foreground">
        손익: {formatCurrency(data.gainLoss)} ({formatPercent(data.returnRate)})
      </p>
    </div>
  );
}

export function TopHoldingsBarChart({ holdings, stocks }: TopHoldingsBarChartProps) {
  const data = transformTopHoldings(holdings, stocks);
  const chartHeight = Math.max(200, data.length * 40);

  return (
    <ChartContainer
      title="Top 10 보유종목"
      isEmpty={data.length === 0}
      emptyMessage="보유 종목이 없습니다"
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ left: 70, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
          <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
