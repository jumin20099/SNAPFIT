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
      // 쿠키에서 JWT 토큰 추출
      const cookies = document.cookie.split(';')
      const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      
      if (jwtCookie) {
        return jwtCookie.split('=')[1]
      }
      
      // 로컬 스토리지에서 토큰 확인
      const token = localStorage.getItem('token')
      if (token) {
        return token
      }
      
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
        console.error('JWT 토큰이 필요합니다. 로그인 후 다시 시도해주세요.')
        setError('JWT 토큰이 필요합니다. 로그인 후 다시 시도해주세요.')
        setIsConnected(false)
        return
      }

      // 기존 연결이 있다면 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      // 토큰을 쿼리 파라미터로 전달
      const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(token)}`
      console.log('SSE 연결 시도:', sseUrl)
      
      const eventSource = new EventSource(sseUrl)

      // 연결 성공 시
      eventSource.onopen = () => {
        console.log('SSE 연결 성공')
        setIsConnected(true)
        setError(null)
        setReconnectAttempts(0)
        reconnectAttemptsRef.current = 0
      }

      // 연결 완료 이벤트
      eventSource.addEventListener('connect', (event) => {
        console.log('SSE 연결 설정 완료:', event.data)
      })

      // 새로운 알림 이벤트
      eventSource.addEventListener('notification', (event) => {
        try {
          const notification = JSON.parse(event.data) as NotificationEvent
          console.log('새로운 알림 수신:', notification)
          
          // 읽지 않은 알림 개수 증가
          setUnreadCount(prev => prev + 1)
          
          // 토스트 알림 표시 (선택사항)
          showToastNotification(notification)
        } catch (err) {
          console.error('알림 데이터 파싱 오류:', err)
        }
      })

      // 읽지 않은 알림 개수 업데이트
      eventSource.addEventListener('unread_count', (event) => {
        try {
          const count = parseInt(event.data, 10)
          console.log('읽지 않은 알림 개수 업데이트:', count)
          setUnreadCount(count)
        } catch (err) {
          console.error('알림 개수 파싱 오류:', err)
        }
      })

      // 오류 처리
      eventSource.onerror = (error) => {
        console.error('SSE 연결 오류:', error)
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
          setError(`SSE 재연결 실패 (${maxReconnectAttempts}회 시도). 서버 연결을 확인해주세요.`)
        }
      }

      eventSourceRef.current = eventSource

    } catch (err) {
      console.error('SSE 연결 오류:', err)
      setError('SSE 연결에 실패했습니다')
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
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setError(`SSE 재연결 실패 (${maxReconnectAttempts}회 시도). 서버 연결을 확인해주세요.`)
      return
    }

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
  }, [connect, maxReconnectAttempts, reconnectInterval])

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
    
    if (autoConnect && token) {
      // 토큰이 있으면 자동 연결
      connect()
    } else if (autoConnect) {
      // 토큰이 없으면 에러 상태로 설정
      setError('JWT 토큰이 필요합니다. 로그인 후 다시 시도해주세요.')
      setIsConnected(false)
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
