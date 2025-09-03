'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface CodyStepIndicatorProps {
  currentStep: number
  steps: string[]
}

export function CodyStepIndicator({ currentStep, steps }: CodyStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              index <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index < currentStep ? (
              <Check size={16} />
            ) : (
              index + 1
            )}
          </motion.div>
          <span className={`ml-2 text-sm font-medium ${
            index <= currentStep ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-4 ${
              index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}
