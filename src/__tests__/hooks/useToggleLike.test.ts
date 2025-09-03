import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleLike } from '@/shared/hooks/useToggleLike';
import React from 'react';

// 테스트용 QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// 테스트용 래퍼
const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useToggleLike', () => {
  beforeEach(() => {
    // fetch 모킹 리셋
    (global.fetch as jest.Mock).mockClear();
  });

  it('좋아요 토글이 성공적으로 작동해야 한다', async () => {
    // Mock API 응답 설정
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        liked: true,
        count: 42,
      }),
    });

    const { result } = renderHook(
      () => useToggleLike({
        targetIdx: 1,
        targetType: 'product',
      }),
      { wrapper }
    );

    // 초기 상태 확인
    expect(result.current.isPending).toBe(false);

    // 좋아요 토글 실행
    result.current.mutate();

    // 성공 상태 확인 (isPending은 매우 빠르게 변경될 수 있음)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      liked: true,
      count: 42,
    });
  });

  it('API 오류 시 에러 상태를 반환해야 한다', async () => {
    // Mock API 오류 응답 설정
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const { result } = renderHook(
      () => useToggleLike({
        targetIdx: 1,
        targetType: 'product',
      }),
      { wrapper }
    );

    // 좋아요 토글 실행
    result.current.mutate();

    // 에러 상태 확인
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('성공 콜백이 호출되어야 한다', async () => {
    const onSuccess = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        liked: true,
        count: 42,
      }),
    });

    const { result } = renderHook(
      () => useToggleLike({
        targetIdx: 1,
        targetType: 'product',
        onSuccess,
      }),
      { wrapper }
    );

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(onSuccess).toHaveBeenCalledWith({
      liked: true,
      count: 42,
    });
  });

  it('에러 콜백이 호출되어야 한다', async () => {
    const onError = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const { result } = renderHook(
      () => useToggleLike({
        targetIdx: 1,
        targetType: 'product',
        onError,
      }),
      { wrapper }
    );

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(onError).toHaveBeenCalled();
  });
});
