'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      toast.success('태그가 생성되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success('태그가 삭제되었습니다.');
    },
    onError: () => {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
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
    onError: () => {
      toast.error('태그 추가에 실패했습니다.');
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
    onError: () => {
      toast.error('태그 제거에 실패했습니다.');
    },
  });
}
