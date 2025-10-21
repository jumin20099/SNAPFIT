import { NextRequest } from 'next/server'
import { extractBearerToken, mergeHeaders } from '@/api/_utils/auth'

const BACKEND_BASE = process.env.BACKEND_URL || 'http://localhost:8080'

type FetchOptions = {
  path: string
  init?: RequestInit
  retryOnUnauthorized?: boolean
}

type FetchResult = {
  response: Response
  refreshedCookie?: string | null
  accessToken?: string | null
}

export async function fetchBackendWithAuth(
  req: NextRequest,
  { path, init, retryOnUnauthorized = true }: FetchOptions
): Promise<FetchResult> {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const initialToken = extractBearerToken(req)

  const prepared = prepareRequest(init, {
    authorization: initialToken ? `Bearer ${initialToken}` : undefined,
    cookie: cookieHeader || undefined,
  })

  let response = await fetch(`${BACKEND_BASE}${path}`, prepared)
  if (!(retryOnUnauthorized && response.status === 401)) {
    return { response }
  }

  const refreshResult = await refreshAccessToken(cookieHeader)
  if (!refreshResult) {
    return { response }
  }

  const retried = prepareRequest(init, {
    authorization: refreshResult.accessToken
      ? `Bearer ${refreshResult.accessToken}`
      : undefined,
    cookie: cookieHeader || undefined,
  })

  response = await fetch(`${BACKEND_BASE}${path}`, retried)
  return {
    response,
    refreshedCookie: refreshResult.setCookie,
    accessToken: refreshResult.accessToken,
  }
}

function prepareRequest(
  init: RequestInit | undefined,
  extraHeaders: { authorization?: string; cookie?: string }
): RequestInit {
  const headers = mergeHeaders(init?.headers, {
    Authorization: extraHeaders.authorization,
    Cookie: extraHeaders.cookie,
  })

  return {
    ...init,
    headers,
    credentials: 'include',
  }
}

async function refreshAccessToken(cookieHeader: string): Promise<
  | {
      accessToken: string | null
      setCookie: string | null
    }
  | null
> {
  if (!cookieHeader) {
    return null
  }

  const refreshResponse = await fetch(`${BACKEND_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: mergeHeaders(undefined, {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    }),
    body: JSON.stringify({}),
    credentials: 'include',
  })

  if (!refreshResponse.ok) {
    return null
  }

  const setCookie = refreshResponse.headers.get('set-cookie')
  const accessToken = extractCookieValue(setCookie, 'access_token')

  return {
    accessToken,
    setCookie,
  }
}

function extractCookieValue(setCookieHeader: string | null, name: string): string | null {
  if (!setCookieHeader) return null

  const cookieStrings = setCookieHeader
    .split(/,(?=[^;=]+=[^;=]+)/)
    .map((cookie) => cookie.trim())

  for (const cookie of cookieStrings) {
    if (cookie.startsWith(`${name}=`)) {
      const end = cookie.indexOf(';')
      return end === -1 ? cookie.substring(name.length + 1) : cookie.substring(name.length + 1, end)
    }
  }
  return null
}
