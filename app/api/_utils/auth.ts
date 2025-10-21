import { NextRequest } from 'next/server'

/**
 * Extracts a bearer token from a Next.js request.
 * Priority: Authorization header > access_token cookie > legacy token cookie > query parameter.
 */
export function extractBearerToken(req: NextRequest): string | null {
  const headerToken = req.headers.get('authorization')
  if (headerToken?.startsWith('Bearer ')) {
    return headerToken.slice(7)
  }

  const cookieToken =
    req.cookies.get('access_token')?.value ??
    req.cookies.get('token')?.value

  if (cookieToken) {
    return cookieToken
  }

  const queryToken = req.nextUrl?.searchParams?.get('token')
  return queryToken ?? null
}

/**
 * Copies the incoming X-CSRF-TOKEN header if present.
 */
export function extractCsrfHeader(req: NextRequest): string | null {
  return req.headers.get('x-csrf-token')
}

export function mergeHeaders(
  base: HeadersInit | undefined,
  additions: Record<string, string | undefined>
): Headers {
  const headers = new Headers(base ?? {})
  Object.entries(additions).forEach(([key, value]) => {
    if (value && !headers.has(key)) {
      headers.set(key, value)
    } else if (value) {
      headers.set(key, value)
    }
  })
  return headers
}
