"use client"
import { useSSENotifications } from "../hooks/useSSENotifications";

export default function SSETest() {
  const { 
    isConnected, 
    error, 
    reconnect
  } = useSSENotifications();

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">SSE 연결 상태</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">연결 상태: </span>
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "연결됨" : "연결 안됨"}
          </span>
        </div>
        {error && (
          <div>
            <span className="font-medium">오류: </span>
            <span className="text-red-600">{error}</span>
          </div>
        )}
        <button
          onClick={reconnect}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          재연결
        </button>
      </div>
    </div>
  );
}
