'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from 'sonner'

interface Report {
  reportId: string
  reporterId: string
  targetType: 'POST' | 'COMMENT' | 'USER'
  targetId?: number
  targetUserId?: string
  reason?: string
  category: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
}

interface ReportCardProps {
  report: Report
  onStatusChange: (reportId: string, status: 'APPROVED' | 'REJECTED', memo?: string) => void
}

export function ReportCard({ report, onStatusChange }: ReportCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMemoDialog, setShowMemoDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [memo, setMemo] = useState('')

  const targetTypeLabels = {
    POST: '게시글',
    COMMENT: '댓글',
    USER: '사용자'
  }

  const statusLabels = {
    PENDING: '대기중',
    APPROVED: '승인',
    REJECTED: '거부'
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  }

  const handleAction = (action: 'APPROVED' | 'REJECTED') => {
    setSelectedAction(action)
    setShowMemoDialog(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedAction) return

    setIsProcessing(true)
    try {
      await onStatusChange(report.reportId, selectedAction, memo.trim() || undefined)
      setShowMemoDialog(false)
      setMemo('')
      setSelectedAction(null)
      toast.success(`신고가 ${selectedAction === 'APPROVED' ? '승인' : '거부'}되었습니다`)
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              신고 #{report.reportId.slice(-8)}
            </CardTitle>
            <Badge className={statusColors[report.status]}>
              {statusLabels[report.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">대상:</span>
              <span className="ml-1 font-medium">
                {targetTypeLabels[report.targetType]}
                {report.targetId && ` #${report.targetId}`}
              </span>
            </div>
            <div>
              <span className="text-gray-500">카테고리:</span>
              <span className="ml-1 font-medium">{report.category}</span>
            </div>
          </div>
          
          {report.reason && (
            <div>
              <span className="text-gray-500 text-sm">사유:</span>
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                {report.reason}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            신고일: {new Date(report.createdAt).toLocaleString('ko-KR')}
          </div>
          
          {report.status === 'PENDING' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleAction('APPROVED')}
                disabled={isProcessing}
                className="flex-1"
              >
                승인
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction('REJECTED')}
                disabled={isProcessing}
                className="flex-1"
              >
                거부
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showMemoDialog}
        onClose={() => {
          setShowMemoDialog(false)
          setMemo('')
          setSelectedAction(null)
        }}
        onConfirm={handleConfirmAction}
        title={`신고 ${selectedAction === 'APPROVED' ? '승인' : '거부'}`}
        description={`신고를 ${selectedAction === 'APPROVED' ? '승인' : '거부'}하시겠습니까?`}
        confirmText={selectedAction === 'APPROVED' ? '승인' : '거부'}
        variant={selectedAction === 'REJECTED' ? 'destructive' : 'default'}
        isLoading={isProcessing}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            처리 메모 (선택사항)
          </label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="처리 사유나 메모를 입력하세요"
            className="min-h-[80px]"
          />
        </div>
      </ConfirmDialog>
    </>
  )
}
