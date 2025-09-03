// 모달 상태 머신 타입 정의
export type ModalKind = 
  | 'none' 
  | 'myPage' 
  | 'login' 
  | 'signup' 
  | 'community' 
  | 'product';

export type ModalState = {
  kind: ModalKind;
};

export type ModalAction = 
  | { type: 'OPEN'; to: ModalKind }
  | { type: 'CLOSE' }
  | { type: 'SWITCH_TO_SIGNUP' }
  | { type: 'SWITCH_TO_LOGIN' }
  | { type: 'OPEN_COMMUNITY' }
  | { type: 'CLOSE_COMMUNITY' };

// 모달 리듀서
export function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN':
      return { kind: action.to };
    case 'CLOSE':
      return { kind: 'none' };
    case 'SWITCH_TO_SIGNUP':
      return { kind: 'signup' };
    case 'SWITCH_TO_LOGIN':
      return { kind: 'login' };
    case 'OPEN_COMMUNITY':
      return { kind: 'community' };
    case 'CLOSE_COMMUNITY':
      return { kind: 'none' };
    default:
      return state;
  }
}

// 초기 상태
export const initialModalState: ModalState = {
  kind: 'none',
};

// 모달 상태 확인 헬퍼 함수들
export const isModalOpen = (state: ModalState): boolean => {
  return state.kind !== 'none';
};

export const isSpecificModalOpen = (state: ModalState, kind: ModalKind): boolean => {
  return state.kind === kind;
};
