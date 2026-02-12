'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useTags,
  useStockTags,
  useCreateTag,
  useAddTagToStock,
  useRemoveTagFromStock,
} from '@/lib/hooks/use-tags';

const TAG_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface TagInputProps {
  stockId: string;
}

export function TagInput({ stockId }: TagInputProps) {
  const { data: allTags } = useTags();
  const { data: stockTags } = useStockTags(stockId);
  const createTag = useCreateTag();
  const addTagToStock = useAddTagToStock();
  const removeTagFromStock = useRemoveTagFromStock();

  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stockTagIds = new Set(stockTags?.map((t) => t.id) ?? []);

  // Available tags that aren't already on this stock
  const availableTags = allTags?.filter((t) => !stockTagIds.has(t.id)) ?? [];

  // Filtered suggestions
  const suggestions = inputValue
    ? availableTags.filter((t) =>
        t.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : availableTags;

  const exactMatch = allTags?.find(
    (t) => t.name.toLowerCase() === inputValue.toLowerCase()
  );

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsAdding(false);
        setInputValue('');
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddExistingTag = async (tagId: string) => {
    addTagToStock.mutate({ stockId, tagId });
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleCreateAndAdd = async () => {
    if (!inputValue.trim()) return;

    const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const tag = await createTag.mutateAsync({
      name: inputValue.trim(),
      color: randomColor,
    });
    addTagToStock.mutate({ stockId, tagId: tag.id });
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagFromStock.mutate({ stockId, tagId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exactMatch && !stockTagIds.has(exactMatch.id)) {
        handleAddExistingTag(exactMatch.id);
      } else if (inputValue.trim() && !exactMatch) {
        handleCreateAndAdd();
      }
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" ref={containerRef}>
      {stockTags?.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="gap-1 pr-1"
          style={
            tag.color
              ? { backgroundColor: tag.color, color: '#fff' }
              : undefined
          }
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="ml-0.5 rounded-full hover:bg-black/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {isAdding ? (
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="태그 이름"
            className="h-7 w-36 text-xs"
          />
          {showSuggestions && (suggestions.length > 0 || (inputValue.trim() && !exactMatch)) && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-popover border rounded-md shadow-md z-50 max-h-48 overflow-auto">
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2"
                  onClick={() => handleAddExistingTag(tag.id)}
                >
                  {tag.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  {tag.name}
                </button>
              ))}
              {inputValue.trim() && !exactMatch && (
                <button
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent text-muted-foreground border-t"
                  onClick={handleCreateAndAdd}
                >
                  <Plus className="h-3 w-3 inline mr-1" />
                  &quot;{inputValue.trim()}&quot; 생성
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          태그 추가
        </Button>
      )}
    </div>
  );
}
