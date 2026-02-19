'use client';

import { useAccounts } from '@/lib/hooks/use-accounts';
import { useQuery } from '@tanstack/react-query';
import { getAllHoldings } from '@/lib/db/queries';
import { calculateAccountStats } from '@/lib/utils/calculations';
import { AccountCard } from './account-card';
import { CardGridSkeleton } from '@/components/common/skeletons';
import { EmptyState } from '@/components/common/empty-state';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AccountStats } from '@/lib/types';

interface AccountListProps {
  onAddAccount: () => void;
}

export function AccountList({ onAddAccount }: AccountListProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: getAllHoldings,
  });

  if (accountsLoading || holdingsLoading) {
    return <CardGridSkeleton count={3} />;
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="등록된 계좌가 없습니다"
        description="새 계좌를 추가하여 포트폴리오 관리를 시작하세요."
        action={
          <Button onClick={onAddAccount}>첫 계좌 추가하기</Button>
        }
      />
    );
  }

  // Calculate stats per account
  const statsMap = new Map<string, AccountStats>();
  if (holdings) {
    for (const account of accounts) {
      const accountHoldings = holdings.filter(
        (h) => h.accountId === account.id
      );
      statsMap.set(account.id, calculateAccountStats(accountHoldings));
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          stats={statsMap.get(account.id)}
        />
      ))}
    </div>
  );
}
