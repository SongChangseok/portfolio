'use client';

import Link from 'next/link';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import type { Stock, Tag } from '@/lib/types';

interface StockCardProps {
  stock: Stock;
  tags?: Tag[];
  totalShares?: number;
  totalValue?: number;
}

export function StockCard({
  stock,
  tags = [],
  totalShares = 0,
  totalValue = 0,
}: StockCardProps) {
  return (
    <Link href={`/stocks?id=${stock.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{stock.name}</h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                    style={
                      tag.color
                        ? { backgroundColor: tag.color, color: '#fff' }
                        : undefined
                    }
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">총 보유 수량</span>
              <span className="font-medium">
                {totalShares > 0 ? `${formatNumber(totalShares)}주` : '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">총 평가금액</span>
              <span className="font-medium">
                {totalValue > 0 ? formatCurrency(totalValue) : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
