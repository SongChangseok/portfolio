'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockSchema, type StockFormValues } from '@/lib/utils/validators';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockFormValues) => void;
  defaultValues?: Partial<StockFormValues>;
  isEditing?: boolean;
  isPending?: boolean;
}

export function StockForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
  isPending = false,
}: StockFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      notes: defaultValues?.notes ?? null,
    },
  });

  useEffect(() => {
    if (open && defaultValues) {
      reset({
        name: defaultValues.name ?? '',
        notes: defaultValues.notes ?? null,
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: StockFormValues) => {
    onSubmit(data);
    if (!isEditing) {
      reset();
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset();
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '주식 수정' : '새 주식 추가'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? '주식 정보를 수정합니다.'
              : '새로운 주식 종목을 추가합니다.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="name">종목명</Label>
            <Input
              id="name"
              placeholder="예: 삼성전자, Apple Inc."
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택)</Label>
            <Input
              id="notes"
              placeholder="종목에 대한 메모"
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : isEditing ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
