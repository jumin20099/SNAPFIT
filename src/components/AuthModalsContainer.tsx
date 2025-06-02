"use client"

import MyPage from "@/components/my-page"
import LoginPage from "@/components/login-page"
import SignupPage from "@/components/signup-page"
import { useModals } from "@/contexts/ModalContext"

export const AuthModalsContainer = () => {
  const {
    isMyPageOpen,
    setIsMyPageOpen,
    isLoginOpen,
    setIsLoginOpen,
    isSignupOpen,
    setIsSignupOpen,
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
      <SignupPage
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  )
} 