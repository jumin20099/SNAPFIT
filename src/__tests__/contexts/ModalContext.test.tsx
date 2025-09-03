import { renderHook, act } from '@testing-library/react';
import { ModalProvider, useModals } from '@/contexts/ModalContextV2';
import { ReactNode } from 'react';

// 테스트용 래퍼
const wrapper = ({ children }: { children: ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

describe('ModalContext', () => {
  it('초기 상태가 올바르게 설정되어야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    expect(result.current.state.kind).toBe('none');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
    expect(result.current.isSignupOpen).toBe(false);
    expect(result.current.isCommunityOpen).toBe(false);
    expect(result.current.isProductPanelOpen).toBe(false);
  });

  it('모달을 열고 닫을 수 있어야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    // 로그인 모달 열기
    act(() => {
      result.current.openModal('login');
    });

    expect(result.current.state.kind).toBe('login');
    expect(result.current.isOpen).toBe(true);
    expect(result.current.isLoginOpen).toBe(true);

    // 모달 닫기
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.state.kind).toBe('none');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isLoginOpen).toBe(false);
  });

  it('새로운 API로 모달을 제어할 수 있어야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    // 새로운 API로 모달 열기
    act(() => {
      result.current.openModal('login');
    });

    expect(result.current.isLoginOpen).toBe(true);
    expect(result.current.state.kind).toBe('login');

    // 새로운 API로 모달 닫기
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isLoginOpen).toBe(false);
    expect(result.current.state.kind).toBe('none');
  });

  it('모달 전환이 올바르게 작동해야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    // 로그인에서 회원가입으로 전환
    act(() => {
      result.current.openModal('signup');
    });

    expect(result.current.state.kind).toBe('signup');
    expect(result.current.isSignupOpen).toBe(true);
    expect(result.current.isLoginOpen).toBe(false);

    // 회원가입에서 로그인으로 전환
    act(() => {
      result.current.openModal('login');
    });

    expect(result.current.state.kind).toBe('login');
    expect(result.current.isLoginOpen).toBe(true);
    expect(result.current.isSignupOpen).toBe(false);
  });

  it('커뮤니티 모달이 올바르게 작동해야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    // 커뮤니티 모달 열기
    act(() => {
      result.current.openModal('community');
    });

    expect(result.current.state.kind).toBe('community');
    expect(result.current.isCommunityOpen).toBe(true);

    // 커뮤니티 모달 닫기
    act(() => {
      result.current.closeModal();
    });

    expect(result.current.state.kind).toBe('none');
    expect(result.current.isCommunityOpen).toBe(false);
  });

  it('한 번에 하나의 모달만 열려야 한다', () => {
    const { result } = renderHook(() => useModals(), { wrapper });

    // 로그인 모달 열기
    act(() => {
      result.current.openModal('login');
    });

    expect(result.current.isLoginOpen).toBe(true);
    expect(result.current.isSignupOpen).toBe(false);

    // 회원가입 모달로 전환
    act(() => {
      result.current.openModal('signup');
    });

    expect(result.current.isLoginOpen).toBe(false);
    expect(result.current.isSignupOpen).toBe(true);
  });
});
