'use client'

import { useState, useEffect } from 'react'

export default function NotificationTest() {
  const [token, setToken] = useState<string>('')
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // JWT 토큰 가져오기
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testNotificationsAPI = async () => {
    if (!token) {
      addResult('❌ JWT 토큰이 없습니다')
      return
    }

    setIsLoading(true)
    addResult('🔍 알림 API 테스트 시작...')

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      addResult(`📡 응답 상태: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addResult(`✅ 알림 API 성공: ${data.length}개 알림`)
        console.log('알림 데이터:', data)
      } else {
        const errorText = await response.text()
        addResult(`❌ 알림 API 실패: ${errorText}`)
      }
    } catch (error) {
      addResult(`❌ 알림 API 호출 오류: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSSEConnection = async () => {
    if (!token) {
      addResult('❌ JWT 토큰이 없습니다')
      return
    }

    setIsLoading(true)
    addResult('🔍 SSE 연결 테스트 시작...')

    try {
      const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(token)}`
      addResult(`📡 SSE URL: ${sseUrl}`)

      const eventSource = new EventSource(sseUrl)

      eventSource.onopen = () => {
        addResult('✅ SSE 연결 성공')
      }

      eventSource.addEventListener('connect', (event) => {
        addResult(`✅ SSE 연결 설정 완료: ${event.data}`)
      })

      eventSource.addEventListener('notification', (event) => {
        addResult(`📨 새로운 알림 수신: ${event.data}`)
      })

      eventSource.onerror = (error) => {
        addResult(`❌ SSE 연결 오류: ${error}`)
      }

      // 10초 후 연결 해제
      setTimeout(() => {
        eventSource.close()
        addResult('🔌 SSE 연결 해제')
        setIsLoading(false)
      }, 10000)

    } catch (error) {
      addResult(`❌ SSE 연결 실패: ${error}`)
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token)
      addResult('📋 토큰이 클립보드에 복사되었습니다')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">알림 시스템 테스트</h1>
      
      {/* 토큰 정보 */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">JWT 토큰 상태</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
            {token ? `${token.substring(0, 50)}...` : '토큰 없음'}
          </span>
          {token && (
            <button
              onClick={copyToken}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              복사
            </button>
          )}
        </div>
      </div>

      {/* 테스트 버튼들 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={testNotificationsAPI}
          disabled={isLoading || !token}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          알림 API 테스트
        </button>
        <button
          onClick={testSSEConnection}
          disabled={isLoading || !token}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          SSE 연결 테스트
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          결과 지우기
        </button>
      </div>

      {/* 테스트 결과 */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">테스트 결과</h2>
        <div className="max-h-96 overflow-y-auto space-y-1">
          {testResults.length === 0 ? (
            <p className="text-gray-500">테스트를 실행하면 결과가 여기에 표시됩니다</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 사용법 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">사용법</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>먼저 로그인하여 JWT 토큰을 받으세요</li>
          <li>토큰이 자동으로 저장되면 "알림 API 테스트"를 실행하세요</li>
          <li>API가 성공하면 "SSE 연결 테스트"를 실행하세요</li>
          <li>결과를 확인하여 문제점을 파악하세요</li>
        </ol>
      </div>
    </div>
  )
}

export { NotificationTest }
