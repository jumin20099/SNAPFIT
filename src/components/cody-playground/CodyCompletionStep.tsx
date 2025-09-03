'use client'

import { motion } from 'framer-motion'
import { Check, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodyCompletionStepProps {
  onBack: () => void
  onRestart: () => void
}

export function CodyCompletionStep({ onBack, onRestart }: CodyCompletionStepProps) {
  const handleShare = () => {
    // 공유 로직
    console.log('코디 공유')
  }

  const handleDownload = () => {
    // 다운로드 로직
    console.log('코디 다운로드')
  }

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center p-6"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 완성 아이콘 */}
      <motion.div
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Check size={40} className="text-green-600" />
      </motion.div>

      {/* 완성 메시지 */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          코디 완성! 🎉
        </h2>
        <p className="text-gray-600">
          멋진 코디가 완성되었습니다.<br />
          다른 사람들과 공유해보세요!
        </p>
      </motion.div>

      {/* 액션 버튼들 */}
      <motion.div
        className="w-full space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleShare}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Share2 size={20} className="mr-2" />
          코디 공유하기
        </Button>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Download size={20} className="mr-2" />
          이미지 저장
        </Button>

        <div className="flex space-x-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            이전 단계
          </Button>
          
          <Button
            onClick={onRestart}
            className="flex-1 bg-gray-600 hover:bg-gray-700"
          >
            새 코디 시작
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
