'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CodyHeader } from './cody-playground/CodyHeader'
import { CodyStepIndicator } from './cody-playground/CodyStepIndicator'
import { ProductSelectionStep } from './cody-playground/ProductSelectionStep'
import { CodyCompositionStep } from './cody-playground/CodyCompositionStep'
import { CodyCompletionStep } from './cody-playground/CodyCompletionStep'

const steps = ['상품 선택', '코디 구성', '완성']

export function CodyPlayground() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialProductId = searchParams.get('pid')

  useEffect(() => {
    if (initialProductId) {
      setSelectedProducts([initialProductId])
      setCurrentStep(1)
    }
  }, [initialProductId])

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setSelectedProducts([])
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductSelectionStep
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onNext={handleNext}
          />
        )
      case 1:
        return (
          <CodyCompositionStep
            selectedProducts={selectedProducts}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <CodyCompletionStep
            onBack={handleBack}
            onRestart={handleRestart}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* 헤더 */}
      <CodyHeader currentStep={currentStep} onBack={handleBack} />
      
      {/* 단계 표시기 */}
      <div className="bg-white border-b">
        <CodyStepIndicator currentStep={currentStep} steps={steps} />
      </div>

      {/* 메인 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}