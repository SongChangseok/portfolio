'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountList } from '@/components/accounts/account-list';
import { AccountForm } from '@/components/accounts/account-form';
import { useCreateAccount } from '@/lib/hooks/use-accounts';
import type { AccountFormValues } from '@/lib/utils/validators';

export function AccountsPageClient() {
  const [formOpen, setFormOpen] = useState(false);
  const createAccount = useCreateAccount();

  const handleCreate = (data: AccountFormValues) => {
    createAccount.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">계좌 관리</h1>
          <p className="text-muted-foreground">
            투자 계좌를 추가하고 관리하세요
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          계좌 추가
        </Button>
      </div>

      <AccountList onAddAccount={() => setFormOpen(true)} />

      <AccountForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isPending={createAccount.isPending}
      />
    </div>
  );
}
