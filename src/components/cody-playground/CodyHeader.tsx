'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface CodyHeaderProps {
  currentStep: number
  onBack: () => void
}

export function CodyHeader({ currentStep, onBack }: CodyHeaderProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-white border-b"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center space-x-2"
      >
        <ArrowLeft size={20} />
        <span>뒤로</span>
      </Button>
      
      <h1 className="text-lg font-semibold text-gray-900">
        코디 플레이그라운드
      </h1>
      
      <div className="w-16" /> {/* 공간 확보 */}
    </motion.div>
  )
}
