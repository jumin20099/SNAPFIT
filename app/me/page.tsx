export default function MePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          마이페이지
        </h1>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              프로필
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              사용자 정보를 관리할 수 있습니다.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              설정
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              앱 설정을 변경할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
