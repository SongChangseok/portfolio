'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './chart-container';
import { transformAccountData } from '@/lib/utils/chart-data';
import { getChartColor } from '@/lib/utils/chart-colors';
import { formatCurrency } from '@/lib/utils/formatters';
import { useHoldingsByAccount } from '@/lib/hooks/use-holdings';
import { useStocks } from '@/lib/hooks/use-stocks';
import { Loading } from '@/components/common/loading';

interface AccountAllocationChartProps {
  accountId: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number }; }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        평가금액: {formatCurrency(data.value)}
      </p>
    </div>
  );
}

export function AccountAllocationChart({ accountId }: AccountAllocationChartProps) {
  const { data: holdings, isLoading: holdingsLoading } = useHoldingsByAccount(accountId);
  const { data: stocks, isLoading: stocksLoading } = useStocks();

  if (holdingsLoading || stocksLoading) {
    return <Loading message="차트 데이터 로딩 중..." />;
  }

  if (!holdings || !stocks) return null;

  const data = transformAccountData(holdings, stocks);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) return null;

  return (
    <ChartContainer
      title="종목별 비중"
      isEmpty={data.length === 0}
      emptyMessage="보유 종목이 없습니다"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="35%"
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            formatter={(value: string) => {
              const item = data.find((d) => d.name === value);
              const pct = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              return <span className="text-sm">{value} ({pct}%)</span>;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
