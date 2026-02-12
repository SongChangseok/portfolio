'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTags,
  getStockTags,
  createTag,
  deleteTag,
  addTagToStock,
  removeTagFromStock,
} from '@/lib/db/queries';
import type { Tag } from '@/lib/types';

const TAGS_KEY = ['tags'] as const;
const stockTagsKey = (stockId: string) => ['stocks', stockId, 'tags'] as const;

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: getAllTags,
  });
}

export function useStockTags(stockId: string) {
  return useQuery({
    queryKey: stockTagsKey(stockId),
    queryFn: () => getStockTags(stockId),
    enabled: !!stockId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Tag, 'id' | 'createdAt'>) => createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    },
  });
}

export function useAddTagToStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, tagId }: { stockId: string; tagId: string }) =>
      addTagToStock(stockId, tagId),
    onSuccess: (_, { stockId }) => {
      queryClient.invalidateQueries({ queryKey: stockTagsKey(stockId) });
    },
  });
}

export function useRemoveTagFromStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ stockId, tagId }: { stockId: string; tagId: string }) =>
      removeTagFromStock(stockId, tagId),
    onSuccess: (_, { stockId }) => {
      queryClient.invalidateQueries({ queryKey: stockTagsKey(stockId) });
    },
  });
}
