'use client';

import { Badge } from '@/components/ui/badge';
import { useTags } from '@/lib/hooks/use-tags';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
}

export function TagFilter({ selectedTagId, onChange }: TagFilterProps) {
  const { data: tags } = useTags();

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge
        variant={selectedTagId === null ? 'default' : 'outline'}
        className="cursor-pointer"
        onClick={() => onChange(null)}
      >
        전체
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedTagId === tag.id ? 'default' : 'outline'}
          className={cn('cursor-pointer')}
          style={
            selectedTagId === tag.id && tag.color
              ? { backgroundColor: tag.color, color: '#fff', borderColor: tag.color }
              : tag.color
                ? { borderColor: tag.color, color: tag.color }
                : undefined
          }
          onClick={() => onChange(selectedTagId === tag.id ? null : tag.id)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
