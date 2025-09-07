'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function HeroBanner() {
  // 실제 API에서 배너 데이터를 가져와야 함
  // 현재는 빈 상태로 유지
  const slides: any[] = []
  
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = slides.length

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // 배너 데이터가 없으면 렌더링하지 않음
  if (slides.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <motion.div
        className="relative bg-gradient-to-br from-gray-800 via-gray-600 to-gray-400 p-6 h-48 overflow-hidden w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 좌상단 뱃지 */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              {slides[currentSlide % slides.length].badge}
            </span>
          </div>

          {/* 우하단 페이지 인디케이터 */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <span className="text-white/80 text-xs">
              {currentSlide + 1} / {totalSlides}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 좌측: 타이틀 영역 */}
          <div className="relative z-10 max-w-[60%]">
            <motion.h2
              className="text-white text-2xl font-bold leading-tight mb-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {slides[currentSlide % slides.length].title}
            </motion.h2>
            <motion.p
              className="text-white/90 text-sm leading-relaxed"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {slides[currentSlide % slides.length].subtitle}
            </motion.p>
          </div>

          {/* 우측: 제품 이미지 */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <motion.div
              className="w-24 h-32 bg-black/20 rounded-lg flex items-center justify-center"
              initial={{ x: 20, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className="text-white/60 text-xs">로퍼 이미지</span>
            </motion.div>
          </div>

          {/* 네비게이션 버튼 */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </motion.div>
    </div>
  )
}
