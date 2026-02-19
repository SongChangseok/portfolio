'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/common/loading';
import { EmptyState } from '@/components/common/empty-state';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { AccountForm } from '@/components/accounts/account-form';
import { HoldingTable } from '@/components/holdings/holding-table';
import { AccountAllocationChart } from '@/components/charts/account-allocation-chart';
import {
  useAccount,
  useAccountStats,
  useUpdateAccount,
  useDeleteAccount,
} from '@/lib/hooks/use-accounts';
import {
  formatCurrency,
  formatPercent,
  getGainLossColor,
} from '@/lib/utils/formatters';
import type { AccountFormValues } from '@/lib/utils/validators';

interface AccountDetailProps {
  id: string;
}

export function AccountDetail({ id }: AccountDetailProps) {
  const router = useRouter();

  const { data: account, isLoading: accountLoading } = useAccount(id);
  const { data: stats, isLoading: statsLoading } = useAccountStats(id);
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (accountLoading || statsLoading) {
    return <Loading message="계좌 정보를 불러오는 중..." />;
  }

  if (!account) {
    return (
      <EmptyState
        icon={Wallet}
        title="계좌를 찾을 수 없습니다"
        description="존재하지 않거나 삭제된 계좌입니다."
        action={
          <Button variant="outline" onClick={() => router.push('/accounts')}>
            계좌 목록으로 돌아가기
          </Button>
        }
      />
    );
  }

  const handleUpdate = (data: AccountFormValues) => {
    updateAccount.mutate(
      { id, data },
      {
        onSuccess: () => {
          setEditOpen(false);
        },
      }
    );
  };

  const handleDelete = () => {
    deleteAccount.mutate(id, {
      onSuccess: () => {
        router.push('/accounts');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/accounts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {account.name}
            </h1>
            {account.description && (
              <p className="text-muted-foreground text-sm">
                {account.description}
              </p>
            )}
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                총 매입금액
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalCost)}
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
                className={`text-2xl font-bold ${getGainLossColor(stats.totalReturnRate)}`}
              >
                {formatPercent(stats.totalReturnRate)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Allocation Chart */}
      <AccountAllocationChart accountId={id} />

      {/* Holdings Section */}
      <HoldingTable accountId={id} />

      {/* Edit Dialog */}
      <AccountForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdate}
        defaultValues={{
          name: account.name,
          description: account.description,
        }}
        isEditing
        isPending={updateAccount.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="계좌 삭제"
        description={`"${account.name}" 계좌를 삭제하시겠습니까? 이 계좌에 포함된 모든 보유 종목 정보도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
