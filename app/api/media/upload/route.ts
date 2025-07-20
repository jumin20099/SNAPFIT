import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const formData = await req.formData();

  // Node.js 18+에서는 fetch로 FormData를 바로 전달 가능
  const backendRes = await fetch('http://localhost:8080/api/media/upload', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      // Content-Type은 직접 지정하지 않음
    },
    body: formData as any,
  });

  // 백엔드 응답을 그대로 반환
  const contentType = backendRes.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await backendRes.json()
    : await backendRes.text();

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    { status: backendRes.status, headers: { 'content-type': contentType } }
  );
} 