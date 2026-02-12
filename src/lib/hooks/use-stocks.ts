'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getHoldingsByStock,
} from '@/lib/db/queries';
import type { Stock } from '@/lib/types';

const STOCKS_KEY = ['stocks'] as const;
const stockKey = (id: string) => ['stocks', id] as const;

export function useStocks() {
  return useQuery({
    queryKey: STOCKS_KEY,
    queryFn: getAllStocks,
  });
}

export function useStock(id: string) {
  return useQuery({
    queryKey: stockKey(id),
    queryFn: () => getStockById(id),
    enabled: !!id,
  });
}

export function useStockHoldings(stockId: string) {
  return useQuery({
    queryKey: ['stocks', stockId, 'holdings'] as const,
    queryFn: () => getHoldingsByStock(stockId),
    enabled: !!stockId,
  });
}

export function useCreateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>) =>
      createStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>>;
    }) => updateStock(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
      queryClient.invalidateQueries({ queryKey: stockKey(id) });
    },
  });
}

export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStock(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOCKS_KEY });
    },
  });
}
