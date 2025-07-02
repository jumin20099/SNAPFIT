"use client"

import MyPage from "@/components/my-page"
import LoginPage from "@/components/social-login"
import { useModals } from "../contexts/ModalContext"

export const AuthModalsContainer = () => {
  const {
    isMyPageOpen,
    setIsMyPageOpen,
    isLoginOpen,
    setIsLoginOpen,
    handleSwitchToSignup,
    handleSwitchToLogin,
  } = useModals()

  return (
    <>
      <MyPage open={isMyPageOpen} onOpenChange={setIsMyPageOpen} />
      <LoginPage
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </>
  )
} 