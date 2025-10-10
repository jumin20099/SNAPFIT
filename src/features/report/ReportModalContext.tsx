'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ReportModal } from './ReportModal'

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER'

export interface ReportTarget {
  type: ReportTargetType
  targetId?: number
  targetUserId?: string
  title?: string
  description?: string
  authorName?: string
}

interface ReportModalContextValue {
  isOpen: boolean
  target: ReportTarget | null
  openReportModal: (target: ReportTarget) => void
  closeReportModal: () => void
}

const ReportModalContext = createContext<ReportModalContextValue | undefined>(undefined)

export function ReportModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [target, setTarget] = useState<ReportTarget | null>(null)

  const openReportModal = useCallback((nextTarget: ReportTarget) => {
    setTarget(nextTarget)
    setIsOpen(true)
  }, [])

  const closeReportModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(() => ({
    isOpen,
    target,
    openReportModal,
    closeReportModal
  }), [isOpen, target, openReportModal, closeReportModal])

  return (
    <ReportModalContext.Provider value={value}>
      {children}
      <ReportModal />
    </ReportModalContext.Provider>
  )
}

export function useReportModal() {
  const context = useContext(ReportModalContext)
  if (!context) {
    throw new Error('useReportModal must be used within ReportModalProvider')
  }
  return context
}
