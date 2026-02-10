import type { Holding, AccountStats, PortfolioStats } from '@/lib/types';

// 평가금액 계산 (시장가치)
export function calculateMarketValue(shares: number, currentPrice: number): number {
  return shares * currentPrice;
}

// 매입금액 계산 (원가)
export function calculateCostBasis(shares: number, averageCost: number): number {
  return shares * averageCost;
}

// 손익 계산
export function calculateGainLoss(
  shares: number,
  averageCost: number,
  currentPrice: number
): number {
  return calculateMarketValue(shares, currentPrice) - calculateCostBasis(shares, averageCost);
}

// 수익률 계산 (%)
export function calculateReturnRate(gainLoss: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return (gainLoss / totalCost) * 100;
}

// 비중 계산 (%)
export function calculateAllocation(holdingValue: number, totalValue: number): number {
  if (totalValue === 0) return 0;
  return (holdingValue / totalValue) * 100;
}

// 계좌 통계 계산
export function calculateAccountStats(holdings: Holding[]): AccountStats {
  const totalValue = holdings.reduce(
    (sum, h) => sum + calculateMarketValue(h.shares, h.currentPrice),
    0
  );
  const totalCost = holdings.reduce(
    (sum, h) => sum + calculateCostBasis(h.shares, h.averageCost),
    0
  );
  const totalGainLoss = totalValue - totalCost;
  const totalReturnRate = calculateReturnRate(totalGainLoss, totalCost);

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalReturnRate,
    holdingsCount: holdings.length,
  };
}

// 포트폴리오 전체 통계 계산
export function calculatePortfolioStats(
  allHoldings: Holding[],
  accountsCount: number,
  uniqueStockIds: Set<string>
): PortfolioStats {
  const accountStats = calculateAccountStats(allHoldings);

  return {
    ...accountStats,
    accountsCount,
    stocksCount: uniqueStockIds.size,
  };
}
