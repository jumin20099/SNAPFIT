'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-screen-lg p-4">
      <div className="p-6 border rounded-xl bg-red-50">
        <h1 className="text-xl font-semibold mb-2">상품 정보를 불러오지 못했습니다.</h1>
        <p className="text-sm text-red-600 mb-4">일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        <div className="flex gap-3">
          <button onClick={reset} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">다시 시도</button>
          <a href="/" className="px-3 py-2 rounded border text-sm">홈으로 이동</a>
        </div>
      </div>
    </main>
  )
}

