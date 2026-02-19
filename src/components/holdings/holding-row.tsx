'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  getGainLossColor,
} from '@/lib/utils/formatters';
import {
  calculateMarketValue,
  calculateGainLoss,
  calculateReturnRate,
  calculateCostBasis,
  calculateAllocation,
} from '@/lib/utils/calculations';
import type { Holding, Stock } from '@/lib/types';

interface HoldingRowProps {
  holding: Holding;
  stock: Stock;
  totalValue: number;
  onUpdatePrice: (id: string, currentPrice: number) => void;
  onDelete: (holding: Holding) => void;
}

export function HoldingRow({
  holding,
  stock,
  totalValue,
  onUpdatePrice,
  onDelete,
}: HoldingRowProps) {
  const [editing, setEditing] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const marketValue = calculateMarketValue(holding.shares, holding.currentPrice);
  const costBasis = calculateCostBasis(holding.shares, holding.averageCost);
  const gainLoss = calculateGainLoss(
    holding.shares,
    holding.averageCost,
    holding.currentPrice
  );
  const returnRate = calculateReturnRate(gainLoss, costBasis);
  const allocation = calculateAllocation(marketValue, totalValue);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setEditPrice(String(holding.currentPrice));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditPrice('');
  };

  const confirmEdit = () => {
    const price = Number(editPrice);
    if (!isNaN(price) && price >= 0) {
      onUpdatePrice(holding.id, price);
    }
    setEditing(false);
    setEditPrice('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      confirmEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      {/* 종목명 */}
      <td className="p-3 font-medium">{stock.name}</td>

      {/* 수량 */}
      <td className="p-3 text-right hidden sm:table-cell">{formatNumber(holding.shares)}</td>

      {/* 평균매입가 */}
      <td className="p-3 text-right hidden md:table-cell">{formatCurrency(holding.averageCost)}</td>

      {/* 현재가 (인라인 수정) */}
      <td className="p-3 text-right">
        {editing ? (
          <div className="flex items-center justify-end gap-1">
            <Input
              ref={inputRef}
              type="number"
              step="any"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 w-28 text-right text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={confirmEdit}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={cancelEdit}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-1 hover:text-primary cursor-pointer"
          >
            {formatCurrency(holding.currentPrice)}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
          </button>
        )}
      </td>

      {/* 평가금액 */}
      <td className="p-3 text-right hidden sm:table-cell">{formatCurrency(marketValue)}</td>

      {/* 손익 */}
      <td className={`p-3 text-right hidden md:table-cell ${getGainLossColor(gainLoss)}`}>
        {formatCurrency(gainLoss)}
      </td>

      {/* 수익률 */}
      <td className={`p-3 text-right ${getGainLossColor(returnRate)}`}>
        {formatPercent(returnRate)}
      </td>

      {/* 비중 */}
      <td className="p-3 text-right hidden sm:table-cell">{allocation.toFixed(1)}%</td>

      {/* 삭제 */}
      <td className="p-3 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(holding)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}
