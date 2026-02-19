'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
  action?: React.ReactNode;
  responsive?: boolean;
}

export function ChartContainer({
  title,
  children,
  isEmpty,
  emptyMessage = '데이터가 없습니다',
  className,
  action,
  responsive = false,
}: ChartContainerProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState
            icon={BarChart3}
            title={emptyMessage}
            className="py-8"
          />
        ) : responsive ? (
          <div className="h-48 sm:h-64 md:h-72">{children}</div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
