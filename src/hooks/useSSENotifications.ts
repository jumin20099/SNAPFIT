import { useEffect, useRef, useState, useCallback } from 'react'

interface UseSSENotificationsOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

interface NotificationEvent {
  id: number
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function useSSENotifications(options: UseSSENotificationsOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts: maxReconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // JWT 토큰 가져오기
  const getToken = useCallback(async () => {
    try {
      // 로컬 스토리지에서 토큰 우선 확인
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        console.log('로컬 스토리지에서 JWT 토큰 확인됨')
        return storedToken
      }
      
      // 쿠키에서 JWT 토큰 확인
      const cookies = document.cookie.split(';')
      const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      
      if (jwtCookie) {
        const token = jwtCookie.split('=')[1]
        console.log('쿠키에서 JWT 토큰 확인됨')
        // 로컬 스토리지에도 저장
        localStorage.setItem('token', token)
        return token
      }
      
      console.log('JWT 토큰을 찾을 수 없습니다')
      return null
    } catch (error) {
      console.error('JWT 토큰 가져오기 실패:', error)
      return null
    }
  }, [])

  // URL 파라미터에서 JWT 토큰 저장
  const saveTokenFromUrl = useCallback(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const userIdx = urlParams.get('userIdx')
      
      if (token) {
        // 로컬 스토리지에 토큰 저장
        localStorage.setItem('token', token)
        console.log('URL에서 JWT 토큰 저장 완료')
        
        // userIdx도 저장
        if (userIdx) {
          localStorage.setItem('userIdx', userIdx)
          console.log('사용자 ID 저장 완료:', userIdx)
        }
        
        // URL에서 토큰 파라미터 제거 (보안상)
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('token')
        newUrl.searchParams.delete('userIdx')
        window.history.replaceState({}, '', newUrl.toString())
        
        return token
      }
      return null
    } catch (error) {
      console.error('URL에서 토큰 저장 실패:', error)
      return null
    }
  }, [])

  // SSE 연결
  const connect = useCallback(async () => {
    try {
      const token = await getToken()
      
      // 토큰이 없으면 연결 시도하지 않음
      if (!token) {
        console.log('JWT 토큰이 없습니다. 로그인 후 자동 연결됩니다.')
        setError(null) // 에러 상태 초기화
        setIsConnected(false)
        return
      }

      // 기존 연결이 있으면 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      console.log('SSE 연결 시도:', `/api/notifications/stream?token=${token.substring(0, 20)}...`)
      
      const eventSource = new EventSource(`/api/notifications/stream?token=${token}`)
      
      // 연결 성공
      eventSource.onopen = () => {
        console.log('SSE 연결 성공')
        setIsConnected(true)
        setError(null) // 에러 상태 초기화
        reconnectAttemptsRef.current = 0 // 재연결 시도 횟수 초기화
        setReconnectAttempts(0)
      }

      // 메시지 수신
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE 메시지 수신:', data)
          
          if (data.type === 'NOTIFICATION_COUNT') {
            const count = parseInt(data.count)
            console.log('읽지 않은 알림 개수 업데이트:', count)
            setUnreadCount(count)
          }
        } catch (err) {
          console.error('알림 개수 파싱 오류:', err)
        }
      }

      // 오류 처리
      eventSource.onerror = (error) => {
        console.log('SSE 연결 오류 발생, 자동 재연결 시도 중...')
        setIsConnected(false)
        
        // 자동 재연결 시도
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          setReconnectAttempts(reconnectAttemptsRef.current)
          
          console.log(`SSE 재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`)
          
          // 기존 타임아웃 정리
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          
          // 재연결 시도
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        } else {
          console.log('SSE 재연결 최대 시도 횟수 초과')
          setError('연결이 불안정합니다. 새로고침 후 다시 시도해주세요.')
        }
      }

      eventSourceRef.current = eventSource

    } catch (err) {
      console.error('SSE 연결 초기화 오류:', err)
      setError(null) // 초기화 오류는 사용자에게 보여주지 않음
      setIsConnected(false)
    }
  }, [getToken, maxReconnectAttempts, reconnectInterval])

  // SSE 연결 해제
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setError(null)
  }, [])

  // 재연결 시도
  const reconnect = useCallback(() => {
    console.log('사용자 수동 재연결 시도')
    
    // 에러 상태 초기화
    setError(null)
    
    // 재연결 시도 횟수 초기화
    reconnectAttemptsRef.current = 0
    setReconnectAttempts(0)
    
    // 기존 타임아웃 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    // 즉시 재연결 시도
    connect()
  }, [connect])

  // 실시간 알림 카운트 업데이트
  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  // 알림 읽음 처리 시 카운트 감소
  const markAsReadRealtime = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // 토스트 알림 표시 (선택사항)
  const showToastNotification = useCallback((notification: NotificationEvent) => {
    // 브라우저 알림 API 사용
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || '새로운 알림', {
        body: notification.message,
        icon: '/favicon.ico'
      })
    }
  }, [])

  // 컴포넌트 마운트 시 자동 연결
  useEffect(() => {
    // URL에서 JWT 토큰 저장
    const token = saveTokenFromUrl()
    
    if (autoConnect) {
      if (token) {
        // URL에서 토큰을 받았으면 즉시 연결
        console.log('URL에서 토큰을 받아 즉시 연결 시도')
        connect()
      } else {
        // URL에 토큰이 없으면 로컬 스토리지에서 확인
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
          console.log('로컬 스토리지에서 토큰을 찾아 연결 시도')
          connect()
        } else {
          // 토큰이 전혀 없으면 연결하지 않음 (로그인 전 상태)
          console.log('JWT 토큰이 없습니다. 로그인 후 자동 연결됩니다.')
          setError(null)
          setIsConnected(false)
        }
      }
    }

    return () => {
      disconnect()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [autoConnect, connect, disconnect, saveTokenFromUrl])

  // 재연결 시도 정리
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    unreadCount,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
    updateUnreadCount,
    markAsReadRealtime,
    showToastNotification
  }
}
