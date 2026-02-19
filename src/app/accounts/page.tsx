import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountsPageClient } from '@/components/accounts/accounts-page-client';

export const metadata: Metadata = {
  title: '계좌 관리',
  description: '투자 계좌를 추가하고 관리하세요. 여러 증권사 계좌를 한눈에 파악합니다.',
};

export default function AccountsPage() {
  return (
    <Suspense>
      <AccountsPageClient />
    </Suspense>
  );
}
