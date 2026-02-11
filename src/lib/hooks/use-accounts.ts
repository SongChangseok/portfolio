'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY });
    },
  });
}
