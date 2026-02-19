import type { Account, Holding, Stock, StockTag, Tag } from '@/lib/types';
import { calculateMarketValue, calculateCostBasis, calculateGainLoss, calculateReturnRate } from './calculations';

export interface PieChartDataItem {
  name: string;
  value: number;
  id: string;
}

export interface BarChartDataItem {
  name: string;
  value: number;
  gainLoss: number;
  returnRate: number;
}

export interface TagChartDataItem {
  name: string;
  value: number;
  color: string | null;
}

// 계좌별 비중 데이터 변환
export function transformPortfolioData(
  accounts: Account[],
  holdings: Holding[]
): PieChartDataItem[] {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const grouped = new Map<string, number>();

  for (const h of holdings) {
    const mv = calculateMarketValue(h.shares, h.currentPrice);
    grouped.set(h.accountId, (grouped.get(h.accountId) ?? 0) + mv);
  }

  return Array.from(grouped.entries())
    .map(([accountId, value]) => ({
      name: accountMap.get(accountId)?.name ?? '알 수 없는 계좌',
      value,
      id: accountId,
    }))
    .sort((a, b) => b.value - a.value);
}

// 계좌 내 종목별 비중 데이터 변환
export function transformAccountData(
  holdings: Holding[],
  stocks: Stock[]
): PieChartDataItem[] {
  const stockMap = new Map(stocks.map((s) => [s.id, s]));

  return holdings
    .map((h) => ({
      name: stockMap.get(h.stockId)?.name ?? '알 수 없는 종목',
      value: calculateMarketValue(h.shares, h.currentPrice),
      id: h.id,
    }))
    .sort((a, b) => b.value - a.value);
}

// 태그별 비중 데이터 변환 (다중 태그 시 균등 분배)
export function transformTagData(
  holdings: Holding[],
  stockTags: StockTag[],
  tags: Tag[]
): TagChartDataItem[] {
  const tagMap = new Map(tags.map((t) => [t.id, t]));
  const stockTagMap = new Map<string, string[]>();

  for (const st of stockTags) {
    const existing = stockTagMap.get(st.stockId) ?? [];
    existing.push(st.tagId);
    stockTagMap.set(st.stockId, existing);
  }

  const tagValues = new Map<string, number>();
  let untaggedValue = 0;

  for (const h of holdings) {
    const mv = calculateMarketValue(h.shares, h.currentPrice);
    const tagIds = stockTagMap.get(h.stockId);

    if (!tagIds || tagIds.length === 0) {
      untaggedValue += mv;
    } else {
      const share = mv / tagIds.length;
      for (const tagId of tagIds) {
        tagValues.set(tagId, (tagValues.get(tagId) ?? 0) + share);
      }
    }
  }

  const result: TagChartDataItem[] = Array.from(tagValues.entries())
    .map(([tagId, value]) => {
      const tag = tagMap.get(tagId);
      return {
        name: tag?.name ?? '알 수 없는 태그',
        value,
        color: tag?.color ?? null,
      };
    })
    .sort((a, b) => b.value - a.value);

  if (untaggedValue > 0) {
    result.push({ name: '미분류', value: untaggedValue, color: null });
  }

  return result;
}

// Top N 보유종목 바차트 데이터 변환
export function transformTopHoldings(
  holdings: Holding[],
  stocks: Stock[],
  limit: number = 10
): BarChartDataItem[] {
  const stockMap = new Map(stocks.map((s) => [s.id, s]));

  return holdings
    .map((h) => {
      const mv = calculateMarketValue(h.shares, h.currentPrice);
      const costBasis = calculateCostBasis(h.shares, h.averageCost);
      const gainLoss = calculateGainLoss(h.shares, h.averageCost, h.currentPrice);
      const returnRate = calculateReturnRate(gainLoss, costBasis);
      return {
        name: stockMap.get(h.stockId)?.name ?? '알 수 없는 종목',
        value: mv,
        gainLoss,
        returnRate,
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
