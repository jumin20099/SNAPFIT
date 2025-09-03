"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { 
  ModalState, 
  ModalAction, 
  modalReducer, 
  initialModalState,
  isModalOpen,
  isSpecificModalOpen 
} from "@/entities/modal/model";

interface ModalContextType {
  // 상태 머신 API
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
  
  // 편의 함수들
  openModal: (kind: ModalState['kind']) => void;
  closeModal: () => void;
  isOpen: boolean;
  
  // 특정 모달 상태 확인
  isMyPageOpen: boolean;
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  isCommunityOpen: boolean;
  isProductPanelOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(modalReducer, initialModalState);

  // 편의 함수들
  const openModal = (kind: ModalState['kind']) => {
    dispatch({ type: 'OPEN', to: kind });
  };

  const closeModal = () => {
    dispatch({ type: 'CLOSE' });
  };

  const isOpen = isModalOpen(state);

  // 특정 모달 상태 확인
  const isMyPageOpen = isSpecificModalOpen(state, 'myPage');
  const isLoginOpen = isSpecificModalOpen(state, 'login');
  const isSignupOpen = isSpecificModalOpen(state, 'signup');
  const isCommunityOpen = isSpecificModalOpen(state, 'community');
  const isProductPanelOpen = isSpecificModalOpen(state, 'product');

  return (
    <ModalContext.Provider
      value={{
        state,
        dispatch,
        openModal,
        closeModal,
        isOpen,
        isMyPageOpen,
        isLoginOpen,
        isSignupOpen,
        isCommunityOpen,
        isProductPanelOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
