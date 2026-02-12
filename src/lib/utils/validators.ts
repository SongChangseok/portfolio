import { z } from 'zod';

export const accountSchema = z.object({
  name: z
    .string()
    .min(1, '계좌명을 입력해주세요.')
    .max(50, '계좌명은 50자 이하로 입력해주세요.'),
  description: z.string().nullable(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

export const stockSchema = z.object({
  name: z
    .string()
    .min(1, '종목명을 입력해주세요.')
    .max(100, '종목명은 100자 이하로 입력해주세요.'),
  notes: z.string().nullable(),
});

export type StockFormValues = z.infer<typeof stockSchema>;

export const holdingSchema = z.object({
  accountId: z
    .string()
    .min(1, '계좌를 선택해주세요.'),
  stockId: z
    .string()
    .min(1, '주식을 선택해주세요.'),
  shares: z
    .number({ invalid_type_error: '수량을 입력해주세요.' })
    .positive('수량은 0보다 커야 합니다.'),
  averageCost: z
    .number({ invalid_type_error: '평균 매입가를 입력해주세요.' })
    .nonnegative('평균 매입가는 0 이상이어야 합니다.'),
  currentPrice: z
    .number({ invalid_type_error: '현재가를 입력해주세요.' })
    .nonnegative('현재가는 0 이상이어야 합니다.'),
  notes: z.string().nullable().default(null),
});

export type HoldingFormValues = z.infer<typeof holdingSchema>;

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, '태그명을 입력해주세요.')
    .max(30, '태그명은 30자 이하로 입력해주세요.'),
  color: z.string().nullable().default(null),
});

export type TagFormValues = z.infer<typeof tagSchema>;
