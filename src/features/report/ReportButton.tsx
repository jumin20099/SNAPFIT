'use client'

import { Button } from '@/components/ui/button'
import { Flag } from 'lucide-react'
import { ReportTarget, ReportTargetType, useReportModal } from './ReportModalContext'
import { cn } from '@/lib/utils'
import React from 'react'

interface ReportButtonProps {
  targetType: ReportTargetType
  targetId?: number
  targetUserId?: string
  label?: string
  description?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  className?: string
  'data-testid'?: string
}

export function ReportButton({
  targetId,
  targetUserId,
  targetType,
  label = '신고하기',
  description,
  variant = 'ghost',
  size = 'sm',
  className,
  'data-testid': dataTestId
}: ReportButtonProps) {
  const { openReportModal } = useReportModal()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const target: ReportTarget = {
      type: targetType,
      targetId,
      targetUserId,
      title: label,
      description
    }
    openReportModal(target)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-1 text-gray-600 hover:text-red-500', className)}
      onClick={handleClick}
      data-testid={dataTestId}
    >
      <Flag className="h-4 w-4" />
      {label}
    </Button>
  )
}
