import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyKRW(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

export function logout() {
  // localStorage 토큰 제거
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
  
  // 쿠키 제거 (백엔드 API 호출)
  fetch('/api/auth/logout', {
    method: 'GET',
    credentials: 'include', // 쿠키 포함
  }).catch(error => {
    console.error('로그아웃 API 호출 실패:', error)
  })
  
  // 페이지 새로고침 또는 홈으로 이동
  window.location.href = '/'
}
