"use client"
import { useSSENotifications } from "@/hooks/useSSENotifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Wifi, WifiOff, RefreshCw, TestTube } from "lucide-react"
import { useState, useEffect } from "react"

export function SSETest() {
  const { 
    unreadCount, 
    isConnected, 
    error, 
    reconnectAttempts,
    connect, 
    disconnect, 
    reconnect
  } = useSSENotifications()

  // 백엔드 서버 상태 확인
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products')
        setBackendStatus(response.ok ? 'online' : 'offline')
      } catch {
        setBackendStatus('offline')
      }
    }

    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000) // 30초마다 확인
    
    return () => clearInterval(interval)
  }, [])

  // SSE 상태 확인
  const [sseStatus, setSseStatus] = useState<any>(null)

  const checkSSEStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications/stream')
      if (response.ok) {
        setSseStatus({ status: 'SSE 엔드포인트 사용 가능' })
      } else {
        setSseStatus({ status: 'SSE 엔드포인트 오류', statusCode: response.status })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      setSseStatus({ status: 'SSE 엔드포인트 연결 실패', error: errorMessage })
    }
  }

  useEffect(() => {
    checkSSEStatus()
  }, [])

  // 테스트 알림 생성
  const createTestNotification = async () => {
    try {
      const token = localStorage.getItem('token') || 'test-token'
      const response = await fetch('http://localhost:8080/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('테스트 알림 생성 성공')
      } else {
        console.error('테스트 알림 생성 실패:', response.status)
      }
    } catch (error) {
      console.error('테스트 알림 생성 오류:', error)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">SSE 알림 테스트</h3>
      
      {/* 연결 방식 정보 */}
      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TestTube className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Server-Sent Events (SSE)</span>
        </div>
        <div className="text-xs text-blue-700">
          HTTP 기반의 단방향 실시간 통신을 사용합니다. WebSocket보다 간단하고 안정적입니다.
        </div>
      </div>
      
      {/* 백엔드 서버 상태 */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'online' ? 'bg-green-500' : 
            backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            백엔드 서버: {
              backendStatus === 'online' ? '실행 중' : 
              backendStatus === 'offline' ? '실행 안됨' : '확인 중...'
            }
          </span>
        </div>
        
        {backendStatus === 'offline' && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            <p>백엔드 서버가 실행되지 않았습니다.</p>
            <p>터미널에서 <code className="bg-gray-200 px-1 rounded">cd snapfit-backend && ./gradlew bootRun</code>을 실행해주세요.</p>
          </div>
        )}
      </div>

      {/* SSE 상태 */}
      {sseStatus && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-800">
              SSE 서버: {sseStatus.status}
            </span>
          </div>
          {sseStatus.statusCode && (
            <div className="text-xs text-green-700">
              상태 코드: {sseStatus.statusCode}
            </div>
          )}
        </div>
      )}
      
      {/* 연결 상태 */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">
          {isConnected ? '연결됨' : '연결 안됨'}
        </span>
        {error && (
          <Badge variant="destructive" className="text-xs">
            오류: {error}
          </Badge>
        )}
      </div>

      {/* 연결 정보 */}
      <div className="text-xs text-gray-600 mb-4">
        <div>SSE URL: /api/notifications/stream</div>
        <div>상태: {isConnected ? '활성' : '비활성'}</div>
        <div>프로토콜: HTTP/1.1 (Server-Sent Events)</div>
      </div>

      {/* 알림 개수 */}
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5" />
        <span>읽지 않은 알림: {unreadCount}개</span>
      </div>

      {/* 재연결 시도 횟수 */}
      {reconnectAttempts > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          재연결 시도: {reconnectAttempts}회
        </div>
      )}

      {/* 제어 버튼들 */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={connect} 
          disabled={isConnected || backendStatus === 'offline'}
          size="sm"
          className="flex items-center gap-2"
        >
          <Wifi className="w-4 h-4" />
          연결
        </Button>
        
        <Button 
          onClick={disconnect} 
          disabled={!isConnected}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <WifiOff className="w-4 h-4" />
          연결 해제
        </Button>
        
        <Button 
          onClick={reconnect} 
          disabled={isConnected || backendStatus === 'offline'}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          재연결
        </Button>

        <Button 
          onClick={checkSSEStatus} 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          상태 확인
        </Button>

        <Button 
          onClick={createTestNotification} 
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={!isConnected}
        >
          <TestTube className="w-4 h-4" />
          테스트 알림
        </Button>
      </div>

      {/* SSE 장점 설명 */}
      <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">SSE의 장점</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>간단함:</strong> HTTP 기반으로 복잡한 프로토콜 불필요</li>
            <li><strong>자동 재연결:</strong> 브라우저가 자동으로 연결 복구</li>
            <li><strong>HTTP 호환:</strong> 기존 인증/세션 시스템과 완벽 호환</li>
            <li><strong>가벼움:</strong> WebSocket보다 오버헤드 적음</li>
            <li><strong>단방향 최적화:</strong> 서버→클라이언트 알림에 최적</li>
          </ul>
        </div>
      </div>

      {/* 문제 해결 가이드 */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">SSE 연결 문제 해결</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>SSE 연결이 실패했습니다. 다음을 확인해주세요:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>백엔드에서 SSE 엔드포인트가 제대로 설정되어 있는지 확인</li>
              <li>JWT 토큰이 유효한지 확인</li>
              <li>방화벽이나 프록시 설정으로 인한 HTTP 스트림 차단 여부 확인</li>
              <li>브라우저가 EventSource API를 지원하는지 확인</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
