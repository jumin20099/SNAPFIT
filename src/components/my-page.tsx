'use client'

import { motion } from 'framer-motion'
import { User, Settings, Heart, Bookmark, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* 프로필 섹션 */}
        <motion.div
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              김주민님
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              qazplm20099@gmail.com
            </p>
          </div>
        </motion.div>

        {/* 메뉴 섹션 */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              내 활동
            </h2>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => window.location.href = '/liked-items'}
              >
                <Heart className="w-5 h-5 mr-3 text-red-500" />
                <span className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">좋아요한 목록</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">저장한 상품과 게시글</div>
                </span>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bookmark className="w-5 h-5 mr-3 text-blue-500" />
                <span className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">스크랩한 목록</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">나중에 볼 게시글</div>
                </span>
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              설정
            </h2>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 px-4 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => window.location.href = '/my-page'}
              >
                <Settings className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">프로필 설정</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">개인정보 및 테마 설정</div>
                </span>
              </Button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
            <Button
              variant="ghost"
              className="w-full justify-start h-14 px-4 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-left">
                <div className="font-medium">로그아웃</div>
                <div className="text-sm opacity-75">계정에서 로그아웃</div>
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
