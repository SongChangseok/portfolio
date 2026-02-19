'use client';

import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './chart-container';
import { transformPortfolioData } from '@/lib/utils/chart-data';
import { getChartColor } from '@/lib/utils/chart-colors';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Account, Holding } from '@/lib/types';

interface PortfolioPieChartProps {
  accounts: Account[];
  holdings: Holding[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number }; }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const total = payload[0].payload.value;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        평가금액: {formatCurrency(total)}
      </p>
    </div>
  );
}

export function PortfolioPieChart({ accounts, holdings }: PortfolioPieChartProps) {
  const router = useRouter();
  const data = transformPortfolioData(accounts, holdings);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartContainer
      title="계좌별 비중"
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
            onClick={(entry) => {
              if (entry?.id) router.push(`/accounts/${entry.id}`);
            }}
            style={{ cursor: 'pointer' }}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            formatter={(value: string, entry) => {
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
