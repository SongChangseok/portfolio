'use client';

import { useMemo } from 'react';
import { useStocks } from '@/lib/hooks/use-stocks';
import { useTags } from '@/lib/hooks/use-tags';
import { useQuery } from '@tanstack/react-query';
import { getAllHoldings, getStockTags } from '@/lib/db/queries';
import { calculateMarketValue } from '@/lib/utils/calculations';
import { StockCard } from './stock-card';
import { CardGridSkeleton } from '@/components/common/skeletons';
import { EmptyState } from '@/components/common/empty-state';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tag } from '@/lib/types';

interface StockListProps {
  searchQuery: string;
  selectedTagId: string | null;
  onAddStock: () => void;
}

export function StockList({
  searchQuery,
  selectedTagId,
  onAddStock,
}: StockListProps) {
  const { data: stocks, isLoading: stocksLoading } = useStocks();
  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: getAllHoldings,
  });
  const { data: allTags } = useTags();

  // Fetch tags for all stocks
  const { data: stockTagsMap, isLoading: tagsLoading } = useQuery({
    queryKey: ['stock-tags-map', stocks?.map((s) => s.id).join(',')],
    queryFn: async () => {
      if (!stocks) return new Map<string, Tag[]>();
      const map = new Map<string, Tag[]>();
      for (const stock of stocks) {
        const tags = await getStockTags(stock.id);
        map.set(stock.id, tags);
      }
      return map;
    },
    enabled: !!stocks && stocks.length > 0,
  });

  // Filter stocks based on search and tag
  const filteredStocks = useMemo(() => {
    if (!stocks) return [];

    let result = stocks;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((stock) =>
        stock.name.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTagId && stockTagsMap) {
      result = result.filter((stock) => {
        const tags = stockTagsMap.get(stock.id) ?? [];
        return tags.some((tag) => tag.id === selectedTagId);
      });
    }

    return result;
  }, [stocks, searchQuery, selectedTagId, stockTagsMap]);

  // Calculate per-stock aggregates from holdings
  const stockAggregates = useMemo(() => {
    if (!holdings) return new Map<string, { totalShares: number; totalValue: number }>();

    const map = new Map<string, { totalShares: number; totalValue: number }>();
    for (const holding of holdings) {
      const existing = map.get(holding.stockId) ?? { totalShares: 0, totalValue: 0 };
      existing.totalShares += holding.shares;
      existing.totalValue += calculateMarketValue(holding.shares, holding.currentPrice);
      map.set(holding.stockId, existing);
    }
    return map;
  }, [holdings]);

  if (stocksLoading || holdingsLoading || tagsLoading) {
    return <CardGridSkeleton count={3} />;
  }

  if (!stocks || stocks.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="등록된 주식이 없습니다"
        description="새 주식을 추가하여 포트폴리오 관리를 시작하세요."
        action={
          <Button onClick={onAddStock}>첫 주식 추가하기</Button>
        }
      />
    );
  }

  if (filteredStocks.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="검색 결과가 없습니다"
        description="다른 검색어나 필터를 사용해보세요."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredStocks.map((stock) => {
        const aggregate = stockAggregates.get(stock.id);
        const tags = stockTagsMap?.get(stock.id) ?? [];
        return (
          <StockCard
            key={stock.id}
            stock={stock}
            tags={tags}
            totalShares={aggregate?.totalShares}
            totalValue={aggregate?.totalValue}
          />
        );
      })}
    </div>
  );
}
