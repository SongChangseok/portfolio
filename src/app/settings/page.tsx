import type { Metadata } from 'next';
import { DataManagementCard } from '@/components/settings/data-management-card';

export const metadata: Metadata = {
  title: '설정',
  description: '앱 설정 및 데이터를 관리합니다. 데이터 내보내기, 가져오기, 초기화.',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">앱 설정 및 데이터를 관리합니다.</p>
      </div>
      <DataManagementCard />
    </div>
  );
}
