'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { HoldingForm } from '@/components/holdings/holding-form';
import { HoldingRow } from '@/components/holdings/holding-row';
import {
  useHoldingsByAccount,
  useCreateHolding,
  useUpdateHolding,
  useDeleteHolding,
} from '@/lib/hooks/use-holdings';
import { useStocks } from '@/lib/hooks/use-stocks';
import {
  calculateMarketValue,
  calculateCostBasis,
  calculateGainLoss,
  calculateReturnRate,
} from '@/lib/utils/calculations';
import {
  formatCurrency,
  formatPercent,
  getGainLossColor,
} from '@/lib/utils/formatters';
import type { Holding, Stock } from '@/lib/types';
import type { HoldingFormValues } from '@/lib/utils/validators';

type SortField =
  | 'name'
  | 'shares'
  | 'averageCost'
  | 'currentPrice'
  | 'marketValue'
  | 'gainLoss'
  | 'returnRate'
  | 'allocation';

type SortDirection = 'asc' | 'desc';

interface HoldingTableProps {
  accountId: string;
}

export function HoldingTable({ accountId }: HoldingTableProps) {
  const { data: holdings, isLoading: holdingsLoading } =
    useHoldingsByAccount(accountId);
  const { data: stocks } = useStocks();
  const createHolding = useCreateHolding();
  const updateHolding = useUpdateHolding();
  const deleteHolding = useDeleteHolding();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Holding | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const stockMap = useMemo(() => {
    const map = new Map<string, Stock>();
    stocks?.forEach((s: Stock) => map.set(s.id, s));
    return map;
  }, [stocks]);

  const totalValue = useMemo(() => {
    if (!holdings) return 0;
    return holdings.reduce(
      (sum, h) => sum + calculateMarketValue(h.shares, h.currentPrice),
      0
    );
  }, [holdings]);

  const totals = useMemo(() => {
    if (!holdings || holdings.length === 0)
      return { totalCost: 0, totalGainLoss: 0, totalReturnRate: 0 };

    const totalCost = holdings.reduce(
      (sum, h) => sum + calculateCostBasis(h.shares, h.averageCost),
      0
    );
    const totalGainLoss = totalValue - totalCost;
    const totalReturnRate = calculateReturnRate(totalGainLoss, totalCost);

    return { totalCost, totalGainLoss, totalReturnRate };
  }, [holdings, totalValue]);

  const sortedHoldings = useMemo(() => {
    if (!holdings) return [];

    return [...holdings].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name': {
          const nameA = stockMap.get(a.stockId)?.name ?? '';
          const nameB = stockMap.get(b.stockId)?.name ?? '';
          comparison = nameA.localeCompare(nameB, 'ko');
          break;
        }
        case 'shares':
          comparison = a.shares - b.shares;
          break;
        case 'averageCost':
          comparison = a.averageCost - b.averageCost;
          break;
        case 'currentPrice':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'marketValue':
          comparison =
            calculateMarketValue(a.shares, a.currentPrice) -
            calculateMarketValue(b.shares, b.currentPrice);
          break;
        case 'gainLoss':
          comparison =
            calculateGainLoss(a.shares, a.averageCost, a.currentPrice) -
            calculateGainLoss(b.shares, b.averageCost, b.currentPrice);
          break;
        case 'returnRate': {
          const glA = calculateGainLoss(a.shares, a.averageCost, a.currentPrice);
          const cbA = calculateCostBasis(a.shares, a.averageCost);
          const glB = calculateGainLoss(b.shares, b.averageCost, b.currentPrice);
          const cbB = calculateCostBasis(b.shares, b.averageCost);
          comparison =
            calculateReturnRate(glA, cbA) - calculateReturnRate(glB, cbB);
          break;
        }
        case 'allocation': {
          const mvA = calculateMarketValue(a.shares, a.currentPrice);
          const mvB = calculateMarketValue(b.shares, b.currentPrice);
          comparison = mvA - mvB;
          break;
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [holdings, sortField, sortDirection, stockMap]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const existingStockIds = holdings?.map((h) => h.stockId) ?? [];

  const handleCreate = (data: HoldingFormValues) => {
    createHolding.mutate(
      {
        accountId: data.accountId,
        stockId: data.stockId,
        shares: data.shares,
        averageCost: data.averageCost,
        currentPrice: data.currentPrice,
        lastPriceUpdate: Date.now(),
        notes: data.notes ?? null,
      },
      {
        onSuccess: () => {
          setFormOpen(false);
        },
      }
    );
  };

  const handleUpdatePrice = (id: string, currentPrice: number) => {
    const holding = holdings?.find((h) => h.id === id);
    if (!holding) return;
    updateHolding.mutate({
      id,
      data: { currentPrice },
      accountId: holding.accountId,
      stockId: holding.stockId,
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteHolding.mutate(
      {
        id: deleteTarget.id,
        accountId: deleteTarget.accountId,
        stockId: deleteTarget.stockId,
      },
      {
        onSuccess: () => {
          setDeleteTarget(null);
        },
      }
    );
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-foreground cursor-pointer"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (holdingsLoading) return null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>보유 종목</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            종목 추가
          </Button>
        </CardHeader>
        <CardContent>
          {sortedHoldings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-3 text-left font-medium">
                      <SortButton field="name">종목명</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="shares">수량</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="averageCost">평균매입가</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="currentPrice">현재가</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="marketValue">평가금액</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="gainLoss">손익</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="returnRate">수익률</SortButton>
                    </th>
                    <th className="p-3 text-right font-medium">
                      <SortButton field="allocation">비중</SortButton>
                    </th>
                    <th className="p-3 text-center font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((holding) => {
                    const stock = stockMap.get(holding.stockId);
                    if (!stock) return null;
                    return (
                      <HoldingRow
                        key={holding.id}
                        holding={holding}
                        stock={stock}
                        totalValue={totalValue}
                        onUpdatePrice={handleUpdatePrice}
                        onDelete={setDeleteTarget}
                      />
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="p-3">합계</td>
                    <td className="p-3" colSpan={3}></td>
                    <td className="p-3 text-right">
                      {formatCurrency(totalValue)}
                    </td>
                    <td
                      className={`p-3 text-right ${getGainLossColor(totals.totalGainLoss)}`}
                    >
                      {formatCurrency(totals.totalGainLoss)}
                    </td>
                    <td
                      className={`p-3 text-right ${getGainLossColor(totals.totalReturnRate)}`}
                    >
                      {formatPercent(totals.totalReturnRate)}
                    </td>
                    <td className="p-3 text-right">100%</td>
                    <td className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <EmptyState
              title="보유 종목이 없습니다"
              description="이 계좌에 보유 종목을 추가하세요."
              action={
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  종목 추가
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <HoldingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        accountId={accountId}
        existingStockIds={existingStockIds}
        isPending={createHolding.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="보유 종목 삭제"
        description={`"${deleteTarget ? stockMap.get(deleteTarget.stockId)?.name ?? '알 수 없는 종목' : ''}" 보유 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
