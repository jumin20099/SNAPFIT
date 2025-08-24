// app/api/notifications/stream/route.ts
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const runtime = "nodejs"; // ❗Edge 금지
export const dynamic = "force-dynamic"; // ❗정적 캐시 금지
export const fetchCache = "force-no-store"; // ❗Fetch 캐시 금지

export async function GET(req: NextRequest) {
  // JWT 토큰을 URL 파라미터에서 추출 (EventSource는 헤더를 보낼 수 없음)
  const token = req.nextUrl.searchParams.get("token");
  
  if (!token) {
    console.log("=== SSE 인증 실패: 토큰 파라미터 없음 ===");
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("=== SSE 인증 성공: 토큰 파라미터 있음 ===");
  console.log("토큰 길이:", token.length);

  const controller = new AbortController();
  req.signal?.addEventListener("abort", () => controller.abort());

  const backendUrl = `${process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080"}/api/notifications/stream`;

  // 백엔드로 SSE 업스트림 연결
  const upstream = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    console.log("=== 백엔드 연결 실패:", upstream.status, upstream.statusText, "===");
    return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
  }

  console.log("=== 백엔드 연결 성공: SSE 스트림 시작 ===");

  // Web Streams로 바이트 단위 파이핑
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const reader = upstream.body.getReader();

  // 클라이언트가 끊으면 업스트림/다운스트림 모두 정리
  const abortAll = (err?: unknown) => {
    try {
      reader.cancel().catch(() => {});
    } catch {}
    try {
      writer.close().catch(() => {});
    } catch {}
    controller.abort();
  };

  req.signal?.addEventListener("abort", () => abortAll());

  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writer.write(value); // 그대로 전달
      }
      await writer.close();
    } catch (e) {
      await writer.abort(e);
    } finally {
      controller.abort();
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      // ❗버퍼링/압축/변형 방지
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // nginx 등 프록시 버퍼링 방지
      // CORS가 필요하면 아래 사용 (동일 오리진이면 불필요)
      // "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000",
    },
  });
}