'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { REPORT_CATEGORIES, ReportCategoryValue } from './constants'
import { useReportModal } from './ReportModalContext'
import { useReport } from '@/hooks/useReport'
import { toast } from 'sonner'

const CATEGORY_TEST_IDS: Record<ReportCategoryValue, string> = {
  SPAM: 'report-category-spam',
  INAPPROPRIATE_CONTENT: 'report-category-inappropriate',
  HARASSMENT: 'report-category-harassment',
  OTHER: 'report-category-other'
}

export function ReportModal() {
  const { isOpen, target, closeReportModal } = useReportModal()
  const { createReport, isLoading } = useReport()
  const [category, setCategory] = useState<ReportCategoryValue>('SPAM')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && target) {
      setCategory('SPAM')
      setReason('')
      setError(null)
    }
  }, [isOpen, target])

  const placeholder = useMemo(() => {
    if (!target) return ''
    switch (target.type) {
      case 'POST':
        return '이 게시글을 신고하는 이유를 입력해주세요.'
      case 'COMMENT':
        return '이 댓글을 신고하는 이유를 입력해주세요.'
      case 'USER':
        return '이 사용자를 신고하는 이유를 입력해주세요.'
      default:
        return '신고 사유를 입력해주세요.'
    }
  }, [target])

  const handleSubmit = async () => {
    if (!target) return
    const trimmedReason = reason.trim()
    
    setError(null)
    
    // 카테고리 선택 확인
    if (!category) {
      setError('신고 카테고리를 선택해주세요')
      return
    }
    
    // 신고 사유 필수 검증
    if (trimmedReason.length === 0) {
      setError('신고 사유를 입력해주세요')
      return
    }
    
    // 신고 사유 길이 검증
    if (trimmedReason.length < 3) {
      setError('신고 사유는 3자 이상 입력해주세요')
      return
    }
    
    const success = await createReport({
      targetType: target.type,
      targetId: target.targetId,
      targetUserId: target.targetUserId,
      category,
      reason: trimmedReason.length > 0 ? trimmedReason : null
    })

    if (success) {
      toast.success('신고가 접수되었습니다')
      closeReportModal()
    } else {
      toast.error('신고 접수에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const selectedCategory = REPORT_CATEGORIES.find((option) => option.value === category)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeReportModal() : undefined)}>
      <DialogContent className="sm:max-w-sm max-w-[95vw] mx-4" data-testid="report-modal">
        <DialogHeader>
          <DialogTitle>신고하기</DialogTitle>
          <DialogDescription>
            {target?.title || target?.description || '신고 사유와 카테고리를 선택해주세요.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">신고 카테고리</label>
            <Select value={category} onValueChange={(value: ReportCategoryValue) => setCategory(value)}>
              <SelectTrigger data-testid="report-category-select">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-testid={CATEGORY_TEST_IDS[option.value]}
                  >
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              {selectedCategory.description}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              신고 사유 <span className="text-gray-500">({reason.trim().length}자)</span>
            </label>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={placeholder}
              className="min-h-[120px]"
              data-testid="report-reason-input"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeReportModal} disabled={isLoading}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !category}
              data-testid="submit-report-button"
            >
              {isLoading ? '제출 중...' : '신고 제출'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
