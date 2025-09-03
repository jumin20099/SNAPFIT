'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useCody } from '@/hooks/useCody'

interface CodyCompositionStepProps {
  selectedProducts: string[]
  onNext: () => void
  onBack: () => void
}

export function CodyCompositionStep({ 
  selectedProducts, 
  onNext, 
  onBack 
}: CodyCompositionStepProps) {
  const { items, clearAll } = useCody()

  const handleComplete = () => {
    // 코디 완성 로직
    onNext()
  }

  return (
    <motion.div
      className="flex-1 flex flex-col"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 코디 구성 영역 */}
      <div className="flex-1 p-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            코디 구성하기
          </h2>
          <p className="text-gray-600">
            선택한 상품들을 조합하여 완성된 코디를 만들어보세요
          </p>
        </div>

        {/* 코디 아이템 표시 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(items).map(([slot, item]) => (
            <motion.div
              key={slot}
              className="bg-white rounded-lg p-4 border shadow-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="aspect-square bg-gray-100 rounded-lg mb-2"></div>
              <p className="text-sm font-medium text-gray-900">{item?.name}</p>
              <p className="text-xs text-gray-500">{slot}</p>
            </motion.div>
          ))}
        </div>

        {/* 선택된 상품 수 표시 */}
        <div className="text-center text-sm text-gray-600 mb-4">
          선택된 상품: {selectedProducts.length}개
        </div>
      </div>

      {/* 하단 버튼들 */}
      <div className="p-4 border-t bg-white space-y-3">
        <Button
          onClick={handleComplete}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          코디 완성하기
        </Button>
        
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          상품 다시 선택
        </Button>
      </div>
    </motion.div>
  )
}
