'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      queryClient.invalidateQueries({
        queryKey: ['accounts', variables.accountId, 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['stocks', variables.stockId, 'holdings'],
      });
      toast.success('보유 종목이 추가되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
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
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: HOLDINGS_KEY });
      const previousHoldings = queryClient.getQueryData<Holding[]>(HOLDINGS_KEY);
      queryClient.setQueryData<Holding[]>(HOLDINGS_KEY, (old) =>
        old?.map((h) => (h.id === id ? { ...h, ...data } : h))
      );
      return { previousHoldings };
    },
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
      toast.success('보유 종목이 수정되었습니다.');
    },
    onError: (_, __, context) => {
      if (context?.previousHoldings) {
        queryClient.setQueryData(HOLDINGS_KEY, context.previousHoldings);
      }
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
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
      toast.success('보유 종목이 삭제되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
}
