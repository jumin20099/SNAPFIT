// 알림 API 테스트 스크립트
const testNotifications = async () => {
  console.log('=== 알림 API 테스트 시작 ===');
  
  // 1. JWT 토큰 확인
  const token = localStorage.getItem('token');
  console.log('JWT 토큰:', token ? token.substring(0, 50) + '...' : '없음');
  
  if (!token) {
    console.error('JWT 토큰이 없습니다. 로그인이 필요합니다.');
    return;
  }
  
  // 2. 알림 목록 API 테스트
  try {
    console.log('\n--- 알림 목록 API 테스트 ---');
    const response = await fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('알림 데이터:', data);
    } else {
      const errorText = await response.text();
      console.error('API 오류:', errorText);
    }
  } catch (error) {
    console.error('알림 API 호출 실패:', error);
  }
  
  // 3. SSE 연결 테스트
  try {
    console.log('\n--- SSE 연결 테스트 ---');
    const sseUrl = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
    console.log('SSE URL:', sseUrl);
    
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onopen = () => {
      console.log('SSE 연결 성공');
    };
    
    eventSource.addEventListener('connect', (event) => {
      console.log('SSE 연결 설정 완료:', event.data);
    });
    
    eventSource.addEventListener('notification', (event) => {
      console.log('새로운 알림 수신:', event.data);
    });
    
    eventSource.onerror = (error) => {
      console.error('SSE 연결 오류:', error);
    };
    
    // 5초 후 연결 해제
    setTimeout(() => {
      eventSource.close();
      console.log('SSE 연결 해제');
    }, 5000);
    
  } catch (error) {
    console.error('SSE 연결 실패:', error);
  }
};

// 페이지 로드 후 테스트 실행
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(testNotifications, 2000); // 2초 후 실행
  });
}

// 콘솔에서 직접 실행할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  window.testNotifications = testNotifications;
}
