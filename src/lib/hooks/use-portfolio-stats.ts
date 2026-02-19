'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllAccounts, getAllHoldings, getAllStocks, getAllStockTags } from '@/lib/db/queries';
import {
  calculatePortfolioStats,
  calculateMarketValue,
  calculateCostBasis,
  calculateGainLoss,
  calculateReturnRate,
} from '@/lib/utils/calculations';
import type { DashboardStats, HoldingWithDetails, StockTag } from '@/lib/types';

export function usePortfolioStats() {
  return useQuery({
    queryKey: ['portfolio-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [holdings, accounts, stocks] = await Promise.all([
        getAllHoldings(),
        getAllAccounts(),
        getAllStocks(),
      ]);

      const stockMap = new Map(stocks.map((s) => [s.id, s]));
      const uniqueStockIds = new Set(holdings.map((h) => h.stockId));
      const baseStats = calculatePortfolioStats(holdings, accounts.length, uniqueStockIds);

      const holdingsWithDetails: HoldingWithDetails[] = holdings
        .map((h) => {
          const stock = stockMap.get(h.stockId);
          if (!stock) return null;
          const marketValue = calculateMarketValue(h.shares, h.currentPrice);
          const costBasis = calculateCostBasis(h.shares, h.averageCost);
          const gainLoss = calculateGainLoss(h.shares, h.averageCost, h.currentPrice);
          const returnRate = calculateReturnRate(gainLoss, costBasis);
          return { ...h, stock, marketValue, costBasis, gainLoss, returnRate };
        })
        .filter((h): h is HoldingWithDetails => h !== null);

      const sorted = [...holdingsWithDetails].sort((a, b) => b.returnRate - a.returnRate);
      const topPerformers = sorted.slice(0, 5);
      const worstPerformers = sorted.slice(-5).reverse();

      const lastPriceUpdateAt =
        holdings.length > 0
          ? Math.max(...holdings.map((h) => h.lastPriceUpdate))
          : null;

      return {
        ...baseStats,
        topPerformers,
        worstPerformers,
        lastPriceUpdateAt,
        holdingsWithDetails,
      };
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
