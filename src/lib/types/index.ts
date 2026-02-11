// Database Types

export interface Account {
  id: string;
  name: string;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Holding {
  id: string;
  accountId: string;
  stockId: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  lastPriceUpdate: number;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: number;
}

export interface StockTag {
  stockId: string;
  tagId: string;
}

// Computed types (for UI display)
export interface HoldingWithDetails extends Holding {
  stock: Stock;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  returnRate: number;
}

export interface AccountStats {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalReturnRate: number;
  holdingsCount: number;
}

export interface PortfolioStats extends AccountStats {
  accountsCount: number;
  stocksCount: number;
}
