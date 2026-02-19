import { getDB, generateId, now } from './client';
import type { Account, Stock, Holding, Tag, StockTag } from '@/lib/types';

// ============================================================================
// Accounts
// ============================================================================

export async function getAllAccounts(): Promise<Account[]> {
  const db = getDB();
  return await db.accounts.orderBy('createdAt').reverse().toArray();
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  const db = getDB();
  return await db.accounts.get(id);
}

export async function createAccount(
  data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Account> {
  const db = getDB();
  const account: Account = {
    id: generateId(),
    ...data,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.accounts.add(account);
  return account;
}

export async function updateAccount(
  id: string,
  data: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDB();
  await db.accounts.update(id, {
    ...data,
    updatedAt: now(),
  });
}

export async function deleteAccount(id: string): Promise<void> {
  const db = getDB();
  // Delete all holdings associated with this account
  await db.holdings.where('accountId').equals(id).delete();
  // Delete the account
  await db.accounts.delete(id);
}

// ============================================================================
// Stocks
// ============================================================================

export async function getAllStocks(): Promise<Stock[]> {
  const db = getDB();
  return await db.stocks.orderBy('name').toArray();
}

export async function getStockById(id: string): Promise<Stock | undefined> {
  const db = getDB();
  return await db.stocks.get(id);
}

export async function createStock(
  data: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Stock> {
  const db = getDB();
  const stock: Stock = {
    id: generateId(),
    ...data,
    createdAt: now(),
    updatedAt: now(),
  };
  await db.stocks.add(stock);
  return stock;
}

export async function updateStock(
  id: string,
  data: Partial<Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDB();
  await db.stocks.update(id, {
    ...data,
    updatedAt: now(),
  });
}

export async function deleteStock(id: string): Promise<void> {
  const db = getDB();
  // Delete all holdings associated with this stock
  await db.holdings.where('stockId').equals(id).delete();
  // Delete all stock tags
  await db.stock_tags.where('stockId').equals(id).delete();
  // Delete the stock
  await db.stocks.delete(id);
}

// ============================================================================
// Holdings
// ============================================================================

export async function getAllHoldings(): Promise<Holding[]> {
  const db = getDB();
  return await db.holdings.toArray();
}

export async function getHoldingsByAccount(accountId: string): Promise<Holding[]> {
  const db = getDB();
  return await db.holdings.where('accountId').equals(accountId).toArray();
}

export async function getHoldingsByStock(stockId: string): Promise<Holding[]> {
  const db = getDB();
  return await db.holdings.where('stockId').equals(stockId).toArray();
}

export async function getHoldingById(id: string): Promise<Holding | undefined> {
  const db = getDB();
  return await db.holdings.get(id);
}

export async function createHolding(
  data: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Holding> {
  const db = getDB();
  // Check if holding already exists for this account+stock combination
  const existing = await db.holdings
    .where('[accountId+stockId]')
    .equals([data.accountId, data.stockId])
    .first();

  if (existing) {
    throw new Error('이미 해당 계좌에 이 주식의 보유 정보가 있습니다.');
  }

  const holding: Holding = {
    id: generateId(),
    ...data,
    lastPriceUpdate: now(),
    createdAt: now(),
    updatedAt: now(),
  };
  await db.holdings.add(holding);
  return holding;
}

export async function updateHolding(
  id: string,
  data: Partial<Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const db = getDB();
  const updates = { ...data };

  // If currentPrice is being updated, update lastPriceUpdate
  if (updates.currentPrice !== undefined) {
    updates.lastPriceUpdate = now();
  }

  await db.holdings.update(id, {
    ...updates,
    updatedAt: now(),
  });
}

export async function deleteHolding(id: string): Promise<void> {
  const db = getDB();
  await db.holdings.delete(id);
}

// ============================================================================
// Tags
// ============================================================================

export async function getAllTags(): Promise<Tag[]> {
  const db = getDB();
  return await db.tags.orderBy('name').toArray();
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  const db = getDB();
  return await db.tags.get(id);
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  const db = getDB();
  return await db.tags.where('name').equals(name).first();
}

export async function createTag(
  data: Omit<Tag, 'id' | 'createdAt'>
): Promise<Tag> {
  const db = getDB();
  // Check if tag with this name already exists
  const existing = await getTagByName(data.name);
  if (existing) {
    return existing;
  }

  const tag: Tag = {
    id: generateId(),
    ...data,
    createdAt: now(),
  };
  await db.tags.add(tag);
  return tag;
}

export async function deleteTag(id: string): Promise<void> {
  const db = getDB();
  // Delete all stock_tags associations
  await db.stock_tags.where('tagId').equals(id).delete();
  // Delete the tag
  await db.tags.delete(id);
}

// ============================================================================
// Stock Tags (Many-to-Many relationship)
// ============================================================================

export async function getStockTags(stockId: string): Promise<Tag[]> {
  const db = getDB();
  const stockTags = await db.stock_tags.where('stockId').equals(stockId).toArray();
  const tagIds = stockTags.map(st => st.tagId);
  return await db.tags.where('id').anyOf(tagIds).toArray();
}

export async function addTagToStock(stockId: string, tagId: string): Promise<void> {
  const db = getDB();
  const stockTag: StockTag = { stockId, tagId };
  await db.stock_tags.put(stockTag);
}

export async function removeTagFromStock(stockId: string, tagId: string): Promise<void> {
  const db = getDB();
  await db.stock_tags.where('[stockId+tagId]').equals([stockId, tagId]).delete();
}

export async function getAllStockTags(): Promise<StockTag[]> {
  const db = getDB();
  return await db.stock_tags.toArray();
}

export async function getStocksByTag(tagId: string): Promise<Stock[]> {
  const db = getDB();
  const stockTags = await db.stock_tags.where('tagId').equals(tagId).toArray();
  const stockIds = stockTags.map(st => st.stockId);
  return await db.stocks.where('id').anyOf(stockIds).toArray();
}
