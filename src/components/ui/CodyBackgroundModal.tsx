'use client'

import React, { useState } from 'react'
import { X, Palette, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BACKGROUND_THEMES = {
  white: { name: '화이트', color: '#ffffff' },
  black: { name: '블랙', color: '#000000' },
  cool: { name: '쿨', color: '#f0f9ff' },
  warm: { name: '웜', color: '#fef3c7' },
  lovely: { name: '러블리', color: '#fce7f3' },
} as const

interface CodyBackgroundModalProps {
  isOpen: boolean
  onClose: () => void
  backgroundType: 'color' | 'image'
  onBackgroundTypeChange: (type: 'color' | 'image') => void
  selectedBackground: string
  onBackgroundChange: (background: string) => void
  customColor: string
  onCustomColorChange: (color: string) => void
}

export function CodyBackgroundModal({
  isOpen,
  onClose,
  backgroundType,
  onBackgroundTypeChange,
  selectedBackground,
  onBackgroundChange,
  customColor,
  onCustomColorChange
}: CodyBackgroundModalProps) {

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-bg w-full max-w-md max-h-[80vh] rounded-2xl overflow-hidden transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              배경 설정
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600 dark:text-dark-text" />
            </button>
          </div>

          {/* 타입 선택 */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={backgroundType === 'color' ? 'default' : 'outline'}
              onClick={() => onBackgroundTypeChange('color')}
              className="flex-1"
            >
              <Palette size={16} className="mr-2" />
              단색
            </Button>
            <Button
              variant={backgroundType === 'image' ? 'default' : 'outline'}
              onClick={() => onBackgroundTypeChange('image')}
              className="flex-1"
            >
              <Image size={16} className="mr-2" />
              이미지
            </Button>
          </div>

          {/* 단색 테마 선택 */}
          {backgroundType === 'color' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text">
                기본 테마
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(BACKGROUND_THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => onBackgroundChange(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedBackground === key
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-md mb-2"
                      style={{ backgroundColor: theme.color }}
                    />
                    <div className="text-xs text-gray-700 dark:text-dark-text">
                      {theme.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* 커스텀 색상 */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-3">
                  커스텀 색상
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => onCustomColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-200 dark:border-dark-border cursor-pointer"
                  />
                  <Button
                    onClick={() => onBackgroundChange(customColor)}
                    className="flex-1"
                  >
                    적용
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 이미지 테마 선택 (추후 구현) */}
          {backgroundType === 'image' && (
            <div className="text-center py-12">
              <Image size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-2">
                이미지 테마
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                추후 구현 예정입니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
