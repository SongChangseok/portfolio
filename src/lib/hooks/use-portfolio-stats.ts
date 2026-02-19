'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllAccounts, getAllHoldings, getAllStocks, getAllStockTags } from '@/lib/db/queries';
import { calculatePortfolioStats } from '@/lib/utils/calculations';
import type { PortfolioStats, StockTag } from '@/lib/types';

export function usePortfolioStats() {
  return useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: async (): Promise<PortfolioStats> => {
      const [holdings, accounts, stocks] = await Promise.all([
        getAllHoldings(),
        getAllAccounts(),
        getAllStocks(),
      ]);
      const uniqueStockIds = new Set(holdings.map((h) => h.stockId));
      return calculatePortfolioStats(holdings, accounts.length, uniqueStockIds);
    },
  });
}

export function useAllStockTags() {
  return useQuery({
    queryKey: ['all-stock-tags'],
    queryFn: async (): Promise<StockTag[]> => {
      return getAllStockTags();
    },
  });
}
