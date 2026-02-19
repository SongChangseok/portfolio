'use client';

import Link from 'next/link';
import { Wallet, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Account, AccountStats } from '@/lib/types';

interface AccountCardProps {
  account: Account;
  stats?: AccountStats;
}

export function AccountCard({ account, stats }: AccountCardProps) {
  return (
    <Link href={`/accounts?id=${account.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="flex flex-row items-center gap-3 pb-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{account.name}</h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
            {account.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {account.description}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">총 평가금액</span>
              <span className="font-medium">
                {stats ? formatCurrency(stats.totalValue) : '-'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">보유 종목</span>
              <span className="font-medium">
                {stats ? `${stats.holdingsCount}종목` : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
