'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  label: string
  icon: LucideIcon
}

interface CategoryChipsProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (categoryId: string) => void
}

export function CategoryChips({ categories, selectedCategory, onCategoryChange }: CategoryChipsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        카테고리
      </h3>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 whitespace-nowrap',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              aria-pressed={isSelected}
            >
              <Icon
                size={18}
                className={cn(
                  'transition-all duration-200',
                  isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                )}
              />
              <span className="font-medium text-sm">{category.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
