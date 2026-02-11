import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Account, Stock, Holding, Tag, StockTag } from '@/lib/types';

class PortfolioDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>;
  stocks!: EntityTable<Stock, 'id'>;
  holdings!: EntityTable<Holding, 'id'>;
  tags!: EntityTable<Tag, 'id'>;
  stock_tags!: Table<StockTag>;

  constructor() {
    super('PortfolioDB');

    this.version(1).stores({
      accounts: 'id, name, accountType, createdAt',
      stocks: 'id, &symbol, name, createdAt',
      holdings: 'id, accountId, stockId, [accountId+stockId], createdAt',
      tags: 'id, &name, createdAt',
      stock_tags: '[stockId+tagId], stockId, tagId',
    });

    this.version(2).stores({
      accounts: 'id, name, createdAt',
    });
  }
}

// Lazy initialization - only create when accessed in browser
let dbInstance: PortfolioDB | null = null;

export function getDB(): PortfolioDB {
  if (typeof window === 'undefined') {
    throw new Error('Database can only be accessed in the browser');
  }

  if (!dbInstance) {
    dbInstance = new PortfolioDB();
  }

  return dbInstance;
}

// Helper to generate UUIDs
export function generateId(): string {
  return crypto.randomUUID();
}

// Helper to get current timestamp
export function now(): number {
  return Date.now();
}
