export const BACKEND = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

export function passThroughHeaders(extra?: HeadersInit): HeadersInit {
  // 필요한 최소 헤더만 안전하게 전달
  return {
    ...(extra ?? {}),
    'Content-Type': 'application/json',
  }
}
