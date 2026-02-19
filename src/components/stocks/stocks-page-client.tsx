'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StockList } from '@/components/stocks/stock-list';
import { StockForm } from '@/components/stocks/stock-form';
import { StockSearch } from '@/components/stocks/stock-search';
import { TagFilter } from '@/components/stocks/tag-filter';
import { StockDetail } from '@/components/stocks/stock-detail';
import { useCreateStock } from '@/lib/hooks/use-stocks';
import type { StockFormValues } from '@/lib/utils/validators';

export function StocksPageClient() {
  const searchParams = useSearchParams();
  const stockId = searchParams.get('id');

  const [formOpen, setFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const createStock = useCreateStock();

  const handleCreate = (data: StockFormValues) => {
    createStock.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
      },
    });
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  if (stockId) {
    return <StockDetail id={stockId} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">주식 관리</h1>
          <p className="text-muted-foreground">
            보유 주식 종목을 검색하고 관리하세요
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          주식 추가
        </Button>
      </div>

      <div className="space-y-3">
        <StockSearch value={searchQuery} onChange={handleSearchChange} />
        <TagFilter selectedTagId={selectedTagId} onChange={setSelectedTagId} />
      </div>

      <StockList
        searchQuery={searchQuery}
        selectedTagId={selectedTagId}
        onAddStock={() => setFormOpen(true)}
      />

      <StockForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isPending={createStock.isPending}
      />
    </div>
  );
}
