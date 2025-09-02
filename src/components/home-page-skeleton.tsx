export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* 검색바 스켈레톤 */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="max-w-md mx-auto px-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {/* 카테고리 칩 스켈레톤 */}
        <div className="py-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4 animate-pulse" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl w-24 animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>

        {/* 실루엣 가이드 스켈레톤 */}
        <div className="mb-8">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48" />
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* 상품 그리드 스켈레톤 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
