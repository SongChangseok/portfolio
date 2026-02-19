import { AccountDetail } from '@/components/accounts/account-detail';

export function generateStaticParams() {
  return [];
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AccountDetail id={id} />;
}
