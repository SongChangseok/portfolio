'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StockSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function StockSearch({ value, onChange }: StockSearchProps) {
  const [input, setInput] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input, onChange]);

  useEffect(() => {
    setInput(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="종목명으로 검색..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="pl-9 pr-9"
      />
      {input && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={() => {
            setInput('');
            onChange('');
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
