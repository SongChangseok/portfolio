'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema, type AccountFormValues } from '@/lib/utils/validators';
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

interface AccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormValues) => void;
  defaultValues?: Partial<AccountFormValues>;
  isEditing?: boolean;
  isPending?: boolean;
}

export function AccountForm({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
  isPending = false,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? null,
    },
  });

  const handleFormSubmit = (data: AccountFormValues) => {
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
            {isEditing ? '계좌 수정' : '새 계좌 추가'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? '계좌 정보를 수정합니다.'
              : '새로운 투자 계좌를 추가합니다.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Label htmlFor="name">계좌명</Label>
            <Input
              id="name"
              placeholder="예: NH투자증권"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Input
              id="description"
              placeholder="계좌에 대한 메모"
              {...register('description')}
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
