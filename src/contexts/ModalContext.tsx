"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ModalContextType {
  isMyPageOpen: boolean
  setIsMyPageOpen: (open: boolean) => void
  isLoginOpen: boolean
  setIsLoginOpen: (open: boolean) => void
  isSignupOpen: boolean
  setIsSignupOpen: (open: boolean) => void
  isCommunityOpen: boolean
  setIsCommunityOpen: (open: boolean) => void
  isProductPanelOpen: boolean
  setIsProductPanelOpen: (open: boolean) => void
  handleSwitchToSignup: () => void
  handleSwitchToLogin: () => void
  openCommunity: () => void
  closeCommunity: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isMyPageOpen, setIsMyPageOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isCommunityOpen, setIsCommunityOpen] = useState(false)
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false)

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false)
    setIsSignupOpen(true)
  }

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false)
    setIsLoginOpen(true)
  }

  const openCommunity = () => setIsCommunityOpen(true)
  const closeCommunity = () => setIsCommunityOpen(false)

  return (
    <ModalContext.Provider
      value={{
        isMyPageOpen,
        setIsMyPageOpen,
        isLoginOpen,
        setIsLoginOpen,
        isSignupOpen,
        setIsSignupOpen,
        isCommunityOpen,
        setIsCommunityOpen,
        isProductPanelOpen,
        setIsProductPanelOpen,
        handleSwitchToSignup,
        handleSwitchToLogin,
        openCommunity,
        closeCommunity,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModals() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider")
  }
  return context
} 