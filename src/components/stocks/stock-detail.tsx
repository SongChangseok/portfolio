'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/common/loading';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { StockForm } from '@/components/stocks/stock-form';
import { TagInput } from '@/components/stocks/tag-input';
import {
  useStock,
  useStockHoldings,
  useUpdateStock,
  useDeleteStock,
} from '@/lib/hooks/use-stocks';
import { useQuery } from '@tanstack/react-query';
import { getAllAccounts } from '@/lib/db/queries';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getGainLossColor,
} from '@/lib/utils/formatters';
import {
  calculateMarketValue,
  calculateCostBasis,
  calculateGainLoss,
  calculateReturnRate,
} from '@/lib/utils/calculations';
import type { StockFormValues } from '@/lib/utils/validators';

interface StockDetailProps {
  id: string;
}

export function StockDetail({ id }: StockDetailProps) {
  const router = useRouter();

  const { data: stock, isLoading: stockLoading } = useStock(id);
  const { data: holdings, isLoading: holdingsLoading } = useStockHoldings(id);
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAllAccounts,
  });
  const updateStock = useUpdateStock();
  const deleteStock = useDeleteStock();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const stats = useMemo(() => {
    if (!holdings || holdings.length === 0)
      return { totalShares: 0, totalValue: 0, totalCost: 0, totalGainLoss: 0, returnRate: 0 };

    const totalShares = holdings.reduce((sum, h) => sum + h.shares, 0);
    const totalValue = holdings.reduce(
      (sum, h) => sum + calculateMarketValue(h.shares, h.currentPrice),
      0
    );
    const totalCost = holdings.reduce(
      (sum, h) => sum + calculateCostBasis(h.shares, h.averageCost),
      0
    );
    const totalGainLoss = totalValue - totalCost;
    const returnRate = calculateReturnRate(totalGainLoss, totalCost);

    return { totalShares, totalValue, totalCost, totalGainLoss, returnRate };
  }, [holdings]);

  if (stockLoading || holdingsLoading) {
    return <Loading message="주식 정보를 불러오는 중..." />;
  }

  if (!stock) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="주식을 찾을 수 없습니다"
        description="존재하지 않거나 삭제된 주식입니다."
        action={
          <Button variant="outline" onClick={() => router.push('/stocks')}>
            주식 목록으로 돌아가기
          </Button>
        }
      />
    );
  }

  const handleUpdate = (data: StockFormValues) => {
    updateStock.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteStock.mutate(id, {
      onSuccess: () => {
        router.push('/stocks');
      },
    });
  };

  const accountMap = new Map(accounts?.map((a) => [a.id, a.name]) ?? []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/stocks')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {stock.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            수정
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* Tags */}
      <TagInput stockId={id} />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 보유 수량
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(stats.totalShares)}주
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 평가금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 손익
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${getGainLossColor(stats.totalGainLoss)}`}
            >
              {formatCurrency(stats.totalGainLoss)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              수익률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${getGainLossColor(stats.returnRate)}`}
            >
              {formatPercent(stats.returnRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {stock.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">메모</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {stock.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Holdings by Account */}
      <Card>
        <CardHeader>
          <CardTitle>보유 계좌</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings && holdings.length > 0 ? (
            <div className="space-y-3">
              {holdings.map((holding) => {
                const marketValue = calculateMarketValue(holding.shares, holding.currentPrice);
                const gainLoss = calculateGainLoss(
                  holding.shares,
                  holding.averageCost,
                  holding.currentPrice
                );
                const costBasis = calculateCostBasis(holding.shares, holding.averageCost);
                const returnRate = calculateReturnRate(gainLoss, costBasis);

                return (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {accountMap.get(holding.accountId) ?? '알 수 없는 계좌'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(holding.shares)}주 / 평균 {formatCurrency(holding.averageCost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(marketValue)}
                      </p>
                      <p
                        className={`text-xs ${getGainLossColor(gainLoss)}`}
                      >
                        {formatCurrency(gainLoss)} ({formatPercent(returnRate)})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="보유 정보가 없습니다"
              description="이 주식을 보유한 계좌가 없습니다."
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <StockForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        defaultValues={{
          name: stock.name,
          notes: stock.notes,
        }}
        isEditing
        isPending={updateStock.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="주식 삭제"
        description={`"${stock.name}" 주식을 삭제하시겠습니까? 이 주식과 관련된 모든 보유 종목 정보와 태그도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
