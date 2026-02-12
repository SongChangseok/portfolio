'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { holdingSchema } from '@/lib/utils/validators';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStocks } from '@/lib/hooks/use-stocks';
import type { Stock } from '@/lib/types';

type HoldingFormInput = z.input<typeof holdingSchema>;
type HoldingFormOutput = z.output<typeof holdingSchema>;

interface HoldingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HoldingFormOutput) => void;
  accountId: string;
  existingStockIds?: string[];
  isPending?: boolean;
}

export function HoldingForm({
  open,
  onOpenChange,
  onSubmit,
  accountId,
  existingStockIds = [],
  isPending = false,
}: HoldingFormProps) {
  const { data: stocks } = useStocks();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<HoldingFormInput, unknown, HoldingFormOutput>({
    resolver: zodResolver(holdingSchema),
    defaultValues: {
      accountId,
      stockId: '',
      shares: undefined as unknown as number,
      averageCost: undefined as unknown as number,
      currentPrice: undefined as unknown as number,
      notes: undefined,
    },
  });

  const availableStocks = stocks?.filter(
    (s: Stock) => !existingStockIds.includes(s.id)
  );

  const handleFormSubmit = (data: HoldingFormOutput) => {
    onSubmit(data);
    reset();
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
          <DialogTitle>보유 종목 추가</DialogTitle>
          <DialogDescription>
            이 계좌에 보유 종목을 추가합니다.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Label>종목 선택</Label>
            <Controller
              name="stockId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="종목을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStocks && availableStocks.length > 0 ? (
                      availableStocks.map((stock: Stock) => (
                        <SelectItem key={stock.id} value={stock.id}>
                          {stock.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="_empty" disabled>
                        추가 가능한 종목이 없습니다
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stockId && (
              <p className="text-sm text-destructive">
                {errors.stockId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shares">보유 수량</Label>
            <Input
              id="shares"
              type="number"
              step="any"
              placeholder="예: 100"
              {...register('shares', { valueAsNumber: true })}
            />
            {errors.shares && (
              <p className="text-sm text-destructive">
                {errors.shares.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageCost">평균 매입가</Label>
            <Input
              id="averageCost"
              type="number"
              step="any"
              placeholder="예: 50000"
              {...register('averageCost', { valueAsNumber: true })}
            />
            {errors.averageCost && (
              <p className="text-sm text-destructive">
                {errors.averageCost.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPrice">현재가</Label>
            <Input
              id="currentPrice"
              type="number"
              step="any"
              placeholder="예: 55000"
              {...register('currentPrice', { valueAsNumber: true })}
            />
            {errors.currentPrice && (
              <p className="text-sm text-destructive">
                {errors.currentPrice.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="holdingNotes">메모 (선택)</Label>
            <Input
              id="holdingNotes"
              placeholder="보유 종목에 대한 메모"
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
              {isPending ? '추가 중...' : '추가'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
