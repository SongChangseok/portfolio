'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useState } from 'react';
import {
  exportAllData,
  importAllData,
  resetAllData,
} from '@/lib/db/data-management';

export function DataManagementCard() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportAllData();
      toast.success('데이터가 내보내기 되었습니다.');
    } catch {
      toast.error('내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await importAllData(text);
      queryClient.invalidateQueries();
      toast.success('데이터를 성공적으로 가져왔습니다.');
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류';
      toast.error(`가져오기에 실패했습니다: ${message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAllData();
      queryClient.invalidateQueries();
      toast.success('모든 데이터가 초기화되었습니다.');
    } catch {
      toast.error('초기화에 실패했습니다.');
    } finally {
      setResetting(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
          <CardDescription>
            포트폴리오 데이터를 내보내거나 가져올 수 있습니다. 데이터는 브라우저 로컬에 저장됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 내보내기 */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">데이터 내보내기</p>
              <p className="text-sm text-muted-foreground">
                모든 데이터를 JSON 파일로 다운로드합니다.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? '내보내는 중...' : '내보내기'}
            </Button>
          </div>

          {/* 가져오기 */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">데이터 가져오기</p>
              <p className="text-sm text-muted-foreground">
                JSON 파일에서 데이터를 가져옵니다. 기존 데이터는 대체됩니다.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? '가져오는 중...' : '가져오기'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* 초기화 */}
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
            <div>
              <p className="font-medium text-destructive">데이터 초기화</p>
              <p className="text-sm text-muted-foreground">
                모든 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setResetDialogOpen(true)}
              disabled={resetting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="데이터 초기화"
        description="모든 계좌, 주식, 보유 종목, 태그 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?"
        confirmLabel="초기화"
        onConfirm={handleReset}
        variant="destructive"
      />
    </>
  );
}
