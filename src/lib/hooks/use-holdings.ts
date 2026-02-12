'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllHoldings,
  getHoldingsByAccount,
  getHoldingsByStock,
  createHolding,
  updateHolding,
  deleteHolding,
} from '@/lib/db/queries';
import type { Holding } from '@/lib/types';

const HOLDINGS_KEY = ['holdings'] as const;
const holdingsByAccountKey = (accountId: string) =>
  ['holdings', 'account', accountId] as const;
const holdingsByStockKey = (stockId: string) =>
  ['holdings', 'stock', stockId] as const;

export function useHoldings() {
  return useQuery({
    queryKey: HOLDINGS_KEY,
    queryFn: getAllHoldings,
  });
}

export function useHoldingsByAccount(accountId: string) {
  return useQuery({
    queryKey: holdingsByAccountKey(accountId),
    queryFn: () => getHoldingsByAccount(accountId),
    enabled: !!accountId,
  });
}

export function useHoldingsByStock(stockId: string) {
  return useQuery({
    queryKey: holdingsByStockKey(stockId),
    queryFn: () => getHoldingsByStock(stockId),
    enabled: !!stockId,
  });
}

export function useCreateHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>) =>
      createHolding(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HOLDINGS_KEY });
      queryClient.invalidateQueries({
        queryKey: holdingsByAccountKey(variables.accountId),
      });
      queryClient.invalidateQueries({
        queryKey: holdingsByStockKey(variables.stockId),
      });
      // Invalidate account stats as they depend on holdings
      queryClient.invalidateQueries({
        queryKey: ['accounts', variables.accountId, 'stats'],
      });
      // Invalidate stock holdings
      queryClient.invalidateQueries({
        queryKey: ['stocks', variables.stockId, 'holdings'],
      });
    },
  });
}

export function useUpdateHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>>;
      accountId: string;
      stockId: string;
    }) => updateHolding(id, data),
    onSuccess: (_, { accountId, stockId }) => {
      queryClient.invalidateQueries({ queryKey: HOLDINGS_KEY });
      queryClient.invalidateQueries({
        queryKey: holdingsByAccountKey(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: holdingsByStockKey(stockId),
      });
      queryClient.invalidateQueries({
        queryKey: ['accounts', accountId, 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['stocks', stockId, 'holdings'],
      });
    },
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      accountId: string;
      stockId: string;
    }) => deleteHolding(id),
    onSuccess: (_, { accountId, stockId }) => {
      queryClient.invalidateQueries({ queryKey: HOLDINGS_KEY });
      queryClient.invalidateQueries({
        queryKey: holdingsByAccountKey(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: holdingsByStockKey(stockId),
      });
      queryClient.invalidateQueries({
        queryKey: ['accounts', accountId, 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['stocks', stockId, 'holdings'],
      });
    },
  });
}
