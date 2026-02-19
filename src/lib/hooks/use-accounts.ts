'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getHoldingsByAccount,
} from '@/lib/db/queries';
import { calculateAccountStats } from '@/lib/utils/calculations';
import type { Account, AccountStats } from '@/lib/types';

const ACCOUNTS_KEY = ['accounts'] as const;
const accountKey = (id: string) => ['accounts', id] as const;
const accountStatsKey = (id: string) => ['accounts', id, 'stats'] as const;

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: getAllAccounts,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: accountKey(id),
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
}

export function useAccountStats(id: string) {
  return useQuery({
    queryKey: accountStatsKey(id),
    queryFn: async (): Promise<AccountStats> => {
      const holdings = await getHoldingsByAccount(id);
      return calculateAccountStats(holdings);
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) =>
      createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      toast.success('계좌가 생성되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      queryClient.invalidateQueries({ queryKey: accountKey(id) });
      toast.success('계좌가 수정되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
      toast.success('계좌가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
}
