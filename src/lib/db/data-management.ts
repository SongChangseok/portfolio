import { z } from 'zod';
import { getDB } from './client';
import type { Account, Stock, Holding, Tag, StockTag } from '@/lib/types';

// Zod schemas for import validation
const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const StockSchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const HoldingSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  stockId: z.string(),
  shares: z.number(),
  averageCost: z.number(),
  currentPrice: z.number(),
  lastPriceUpdate: z.number(),
  notes: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
  createdAt: z.number(),
});

const StockTagSchema = z.object({
  stockId: z.string(),
  tagId: z.string(),
});

const ImportSchema = z.object({
  accounts: z.array(AccountSchema),
  stocks: z.array(StockSchema),
  holdings: z.array(HoldingSchema),
  tags: z.array(TagSchema),
  stockTags: z.array(StockTagSchema),
  exportedAt: z.number().optional(),
});

type ExportData = z.infer<typeof ImportSchema>;

export async function exportAllData(): Promise<void> {
  const db = getDB();

  const [accounts, stocks, holdings, tags, stockTags] = await Promise.all([
    db.accounts.toArray(),
    db.stocks.toArray(),
    db.holdings.toArray(),
    db.tags.toArray(),
    db.stock_tags.toArray(),
  ]);

  const exportData: ExportData = {
    accounts,
    stocks,
    holdings,
    tags,
    stockTags,
    exportedAt: Date.now(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `portfolio-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAllData(jsonString: string): Promise<void> {
  const parsed = JSON.parse(jsonString);
  const validated = ImportSchema.parse(parsed);

  const db = getDB();

  await db.transaction(
    'rw',
    [db.accounts, db.stocks, db.holdings, db.tags, db.stock_tags],
    async () => {
      await db.accounts.clear();
      await db.stocks.clear();
      await db.holdings.clear();
      await db.tags.clear();
      await db.stock_tags.clear();

      if (validated.accounts.length > 0) {
        await db.accounts.bulkAdd(validated.accounts as Account[]);
      }
      if (validated.stocks.length > 0) {
        await db.stocks.bulkAdd(validated.stocks as Stock[]);
      }
      if (validated.holdings.length > 0) {
        await db.holdings.bulkAdd(validated.holdings as Holding[]);
      }
      if (validated.tags.length > 0) {
        await db.tags.bulkAdd(validated.tags as Tag[]);
      }
      if (validated.stockTags.length > 0) {
        await db.stock_tags.bulkAdd(validated.stockTags as StockTag[]);
      }
    }
  );
}

export async function resetAllData(): Promise<void> {
  const db = getDB();

  await db.transaction(
    'rw',
    [db.accounts, db.stocks, db.holdings, db.tags, db.stock_tags],
    async () => {
      await db.accounts.clear();
      await db.stocks.clear();
      await db.holdings.clear();
      await db.tags.clear();
      await db.stock_tags.clear();
    }
  );
}
